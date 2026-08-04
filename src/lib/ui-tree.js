export function getSectionId(path = []) {
  return ['root', ...path.filter((segment) => segment !== undefined && segment !== null && segment !== '').map((segment) => String(segment).replace(/[^a-zA-Z0-9]+/g, '-'))].join('_');
}

const MAX_NAVIGATION_DEPTH = 16;

function getValueAtPath(source, path = []) {
  return path.reduce((accumulator, current) => {
    if (accumulator === undefined || accumulator === null) {
      return undefined;
    }
    if (typeof current === 'number') {
      return Array.isArray(accumulator) ? accumulator[current] : undefined;
    }
    return accumulator[current];
  }, source);
}

function mergeSchemaNodes(baseSchema, extensionSchema) {
  if (!extensionSchema || typeof extensionSchema !== 'object') {
    return baseSchema;
  }

  return {
    ...baseSchema,
    ...extensionSchema,
    properties: {
      ...(baseSchema.properties || {}),
      ...(extensionSchema.properties || {})
    },
    required: [...new Set([...(baseSchema.required || []), ...(extensionSchema.required || [])])]
  };
}

function resolveUnionBranch(schemaNode, rootSchema, value) {
  const variants = Array.isArray(schemaNode.oneOf)
    ? schemaNode.oneOf
    : Array.isArray(schemaNode.anyOf)
      ? schemaNode.anyOf
      : null;

  if (!variants || !value || typeof value !== 'object') {
    return null;
  }

  const discriminatorProperty = schemaNode.discriminator?.propertyName;
  const discriminatorValue = discriminatorProperty ? value[discriminatorProperty] : undefined;
  if (!discriminatorValue) {
    return null;
  }

  if (schemaNode.discriminator?.mapping?.[discriminatorValue]) {
    return resolveSchema({ $ref: schemaNode.discriminator.mapping[discriminatorValue] }, rootSchema, value);
  }

  return variants
    .map((variant) => resolveSchema(variant, rootSchema, value))
    .find((variant) => {
      const typeField = variant?.properties?.[discriminatorProperty];
      return Array.isArray(typeField?.enum) && typeField.enum.includes(discriminatorValue);
    }) || null;
}

function resolveSchema(schemaNode, rootSchema, value) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return schemaNode;
  }

  if (schemaNode.$ref) {
    const refParts = schemaNode.$ref.replace('#/', '').split('/');
    let resolved = rootSchema;
    for (const part of refParts) {
      resolved = resolved?.[part];
      if (!resolved) {
        break;
      }
    }
    return resolved ? resolveSchema(resolved, rootSchema, value) : schemaNode;
  }

  if (Array.isArray(schemaNode.allOf)) {
    return schemaNode.allOf.reduce((accumulator, subSchema) => {
      const resolvedSubSchema = resolveSchema(subSchema, rootSchema, value);
      if (!resolvedSubSchema || typeof resolvedSubSchema !== 'object') {
        return accumulator;
      }

      return mergeSchemaNodes(accumulator, resolvedSubSchema);
    }, { ...schemaNode });
  }

  const resolvedUnionBranch = resolveUnionBranch(schemaNode, rootSchema, value);
  if (resolvedUnionBranch) {
    return mergeSchemaNodes(schemaNode, resolvedUnionBranch);
  }

  return schemaNode;
}

function getInheritedProperties(schemaNode, rootSchema) {
  const resolvedSchema = resolveSchema(schemaNode, rootSchema);
  if (!resolvedSchema || typeof resolvedSchema !== 'object') {
    return {};
  }
  if (!Array.isArray(resolvedSchema.allOf)) {
    return resolvedSchema.properties || {};
  }

  return resolvedSchema.allOf.reduce((accumulator, subSchema) => {
    const inherited = getInheritedProperties(subSchema, rootSchema);
    return {
      ...accumulator,
      ...inherited,
      ...(resolvedSchema.properties || {})
    };
  }, {});
}

function getSchemaTitle(schemaNode, fallback = '') {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return fallback;
  }
  return schemaNode.title || schemaNode.name || fallback;
}

function getNavigationTitle(name, schemaNode, value, path = []) {
  const fallback = getSchemaTitle(schemaNode, name);
  const lastSegment = path[path.length - 1];
  if (value && typeof value === 'object') {
    if (value.label) {
      return `${fallback}: ${value.label}`;
    }
    if (value.$type) {
      return value.$type;
    }
  }
  if (typeof lastSegment === 'number') {
    return `${fallback} ${lastSegment + 1}`;
  }
  return fallback;
}

function createVisitedState(visited) {
  if (visited instanceof Map) {
    return new Map(visited);
  }
  if (visited instanceof Set) {
    return new Map(Array.from(visited, (schemaNode) => [schemaNode, new Set()]));
  }
  if (Array.isArray(visited)) {
    return new Map(visited.map((schemaNode) => [schemaNode, new Set()]));
  }
  return new Map();
}

function getSchemaVisitKey(path = []) {
  return path.join('.');
}

function isSchemaVisited(visited, schemaNode, path = []) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return false;
  }
  const visitKey = getSchemaVisitKey(path);
  if (visited instanceof Map) {
    return visited.get(schemaNode)?.has(visitKey) || false;
  }
  if (visited instanceof Set) {
    return visited.has(schemaNode);
  }
  return false;
}

function markSchemaVisited(visited, schemaNode, path = []) {
  if (!schemaNode || typeof schemaNode !== 'object' || !(visited instanceof Map)) {
    return;
  }
  const existingPaths = visited.get(schemaNode) || new Set();
  existingPaths.add(getSchemaVisitKey(path));
  visited.set(schemaNode, existingPaths);
}

function isActionLikeSchema(schemaNode, value, path = []) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return false;
  }
  const hasActionSignals = Boolean(value && typeof value === 'object' && (value.$type || value.label));
  const hasActionChildren = Boolean(schemaNode.properties && (schemaNode.properties.onSuccess || schemaNode.properties.onFailure));
  return hasActionSignals || hasActionChildren;
}

function shouldHideNode(path = []) {
  return path.length === 1 && path[0] === 'properties';
}

function shouldFlattenNode(path = []) {
  return path[path.length - 1] === 'callActions';
}

function getNodeKind(path = []) {
  const lastSegment = path[path.length - 1];
  if (lastSegment === 'onSuccess') {
    return 'success';
  }
  if (lastSegment === 'onFailure') {
    return 'failure';
  }
  if (lastSegment === 'servicesBefore') {
    return 'services-before';
  }
  if (lastSegment === 'servicesAfter') {
    return 'services-after';
  }
  return null;
}

export function buildNavigationTree(rootSchema, currentValue, parentPath = [], depth = 0, visited = new Set(), originalSchema = rootSchema) {
  const resolvedSchema = resolveSchema(rootSchema, originalSchema, currentValue);
  const branchVisited = createVisitedState(visited);
  
  if (!resolvedSchema || typeof resolvedSchema !== 'object' || isSchemaVisited(branchVisited, resolvedSchema, parentPath) || depth > MAX_NAVIGATION_DEPTH) {
    return [];
  }

  markSchemaVisited(branchVisited, resolvedSchema, parentPath);
  if (resolvedSchema.type === 'array') {
    const items = Array.isArray(currentValue) ? currentValue : [];
    return items.map((item, index) => {
      const childSchema = resolveSchema(resolvedSchema.items, originalSchema, item);
      const itemPath = [...parentPath, index];
      const children = buildNavigationTree(childSchema, item, itemPath, depth + 1, branchVisited, originalSchema);
      return {
        id: getSectionId(itemPath),
        title: getNavigationTitle(index, childSchema, item, itemPath),
        children: children.filter(Boolean)
      };
    }).filter(Boolean);
  }

  const properties = {
    ...(resolvedSchema?.properties || {}),
    ...getInheritedProperties(resolvedSchema, originalSchema)
  };

  const nodes = Object.entries(properties).map(([name, propertySchema]) => {
    const childSchema = resolveSchema(propertySchema, originalSchema, getValueAtPath(currentValue, [name]));
    if (childSchema?.['x-hidden']) {
      return null;
    }
    const childValue = getValueAtPath(currentValue, [name]);
    const childPath = [...parentPath, name];

    const children = buildNavigationTree(childSchema, childValue, childPath, depth + 1, branchVisited, originalSchema);
    if (shouldHideNode(childPath)) {
      return null;
    }
    if (shouldFlattenNode(childPath)) {
      return children;
    }
    const shouldExpose = depth === 0 || children.length > 0 || isActionLikeSchema(childSchema, childValue, childPath);
    if (!shouldExpose) {
      return null;
    }
    return {
      id: getSectionId(childPath),
      title: getNavigationTitle(name, childSchema, childValue, childPath),
      kind: getNodeKind(childPath),
      children: children.filter(Boolean)
    };
  }).flat().filter(Boolean);

  return nodes;
}

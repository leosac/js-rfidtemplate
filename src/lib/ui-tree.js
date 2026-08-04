export function getSectionId(path = []) {
  return ['root', ...path.filter((segment) => segment !== undefined && segment !== null && segment !== '').map((segment) => String(segment).replace(/[^a-zA-Z0-9]+/g, '-'))].join('_');
}

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

function resolveSchema(schemaNode, rootSchema) {
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
    return resolved ? resolveSchema(resolved, rootSchema) : schemaNode;
  }

  if (Array.isArray(schemaNode.allOf)) {
    return schemaNode.allOf.reduce((accumulator, subSchema) => {
      const resolvedSubSchema = resolveSchema(subSchema, rootSchema);
      if (!resolvedSubSchema || typeof resolvedSubSchema !== 'object') {
        return accumulator;
      }

      return {
        ...accumulator,
        ...resolvedSubSchema,
        properties: {
          ...(accumulator.properties || {}),
          ...(resolvedSubSchema.properties || {}),
          ...(schemaNode.properties || {})
        },
        required: [...new Set([...(accumulator.required || []), ...(resolvedSubSchema.required || []), ...(schemaNode.required || [])])]
      };
    }, { ...schemaNode });
  }

  return schemaNode;
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
  if (visited instanceof Set) {
    return new Set(visited);
  }
  if (Array.isArray(visited)) {
    return new Set(visited);
  }
  return new Set();
}

function isSchemaVisited(visited, schemaNode) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return false;
  }
  if (visited instanceof Set) {
    return visited.has(schemaNode);
  }
  if (Array.isArray(visited)) {
    return visited.includes(schemaNode);
  }
  return false;
}

function isActionLikeSchema(schemaNode, value, path = []) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return false;
  }
  const lastSegment = path[path.length - 1];
  const hasActionSignals = Boolean(value && typeof value === 'object' && (value.$type || value.label));
  const hasActionChildren = Boolean(schemaNode.properties && (schemaNode.properties.onSuccess || schemaNode.properties.onFailure));
  return hasActionSignals || hasActionChildren || ['onSuccess', 'onFailure'].includes(lastSegment);
}

export function buildNavigationTree(rootSchema, currentValue, parentPath = [], depth = 0, visited = new Set(), originalSchema = rootSchema) {
  const resolvedSchema = resolveSchema(rootSchema, originalSchema);
  const branchVisited = createVisitedState(visited);
  if (!resolvedSchema || typeof resolvedSchema !== 'object' || isSchemaVisited(branchVisited, resolvedSchema) || depth > 4) {
    return [];
  }

  branchVisited.add(resolvedSchema);

  if (resolvedSchema.type === 'array') {
    const items = Array.isArray(currentValue) ? currentValue : [];
    const childSchema = resolveSchema(resolvedSchema.items, originalSchema);
    return items.map((item, index) => {
      const itemPath = [...parentPath, index];
      const children = buildNavigationTree(childSchema, item, itemPath, depth + 1, branchVisited, originalSchema);
      return {
        id: getSectionId(itemPath),
        title: getNavigationTitle(index, childSchema, item, itemPath),
        children: children.filter(Boolean)
      };
    }).filter(Boolean);
  }

  const properties = resolvedSchema?.properties || {};
  const nodes = Object.entries(properties).map(([name, propertySchema]) => {
    const childSchema = resolveSchema(propertySchema, originalSchema);
    if (childSchema?.['x-hidden']) {
      return null;
    }
    const childValue = getValueAtPath(currentValue, [name]);
    const childPath = [...parentPath, name];
    const children = buildNavigationTree(childSchema, childValue, childPath, depth + 1, branchVisited, originalSchema);
    const shouldExpose = depth === 0 || children.length > 0 || isActionLikeSchema(childSchema, childValue, childPath);
    if (!shouldExpose) {
      return null;
    }
    return {
      id: getSectionId(childPath),
      title: getNavigationTitle(name, childSchema, childValue, childPath),
      children: children.filter(Boolean)
    };
  }).filter(Boolean);

  if (isActionLikeSchema(resolvedSchema, currentValue, parentPath) && nodes.length > 0) {
    return [{
      id: getSectionId(parentPath),
      title: getNavigationTitle(parentPath[parentPath.length - 1], resolvedSchema, currentValue, parentPath),
      children: nodes
    }];
  }

  return nodes;
}

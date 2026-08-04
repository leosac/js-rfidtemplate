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

function isActionLikeSchema(schemaNode, value, path = []) {
  if (!schemaNode || typeof schemaNode !== 'object') {
    return false;
  }
  const lastSegment = path[path.length - 1];
  const hasActionSignals = Boolean(value && typeof value === 'object' && (value.$type || value.label));
  const hasActionChildren = Boolean(schemaNode.properties && (schemaNode.properties.onSuccess || schemaNode.properties.onFailure));
  return hasActionSignals || hasActionChildren || ['onSuccess', 'onFailure'].includes(lastSegment);
}

export function buildNavigationTree(rootSchema, currentValue, parentPath = [], depth = 0, visited = new WeakSet(), originalSchema = rootSchema) {
  const resolvedSchema = resolveSchema(rootSchema, originalSchema);
  if (!resolvedSchema || typeof resolvedSchema !== 'object' || visited.has(resolvedSchema) || depth > 4) {
    return [];
  }

  visited.add(resolvedSchema);

  if (resolvedSchema.type === 'array') {
    const items = Array.isArray(currentValue) ? currentValue : [];
    const childSchema = resolveSchema(resolvedSchema.items, originalSchema);
    return items.map((item, index) => {
      const itemPath = [...parentPath, index];
      const children = buildNavigationTree(childSchema, item, itemPath, depth + 1, visited, originalSchema);
      return {
        id: getSectionId(itemPath),
        title: getNavigationTitle(index, childSchema, item, itemPath),
        children: children.filter(Boolean)
      };
    }).filter(Boolean);
  }

  if (isActionLikeSchema(resolvedSchema, currentValue, parentPath)) {
    const actionChildren = [];
    ['onSuccess', 'onFailure'].forEach((childName) => {
      const childSchema = resolveSchema(resolvedSchema.properties?.[childName], originalSchema);
      const childValue = currentValue?.[childName];
      const childNodes = buildNavigationTree(childSchema, childValue, [...parentPath, childName], depth + 1, visited, originalSchema);
      if (childNodes.length > 0) {
        actionChildren.push(...childNodes);
      }
    });
    return [{
      id: getSectionId(parentPath),
      title: getNavigationTitle(parentPath[parentPath.length - 1], resolvedSchema, currentValue, parentPath),
      children: actionChildren
    }];
  }

  const properties = resolvedSchema?.properties || {};
  const nodes = Object.entries(properties).map(([name, propertySchema]) => {
    const childSchema = resolveSchema(propertySchema, originalSchema);
    if (childSchema?.['x-hidden']) {
      return null;
    }
    const childValue = getValueAtPath(currentValue, [name]);
    const childPath = [...parentPath, name];
    const children = buildNavigationTree(childSchema, childValue, childPath, depth + 1, visited, originalSchema);
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

  return nodes;
}

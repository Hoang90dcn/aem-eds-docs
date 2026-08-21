/**
 * Parse Featured Products configuration
 * Google Docs Structure
 *
 * Table 1
 * ----------------------------------
 * Key | Value
 * title | Featured Products
 * api | /api/recommendation
 * bizType | B2C
 * isMember | Y
 * subscribeProduct | N
 *
 * Table 2
 * ----------------------------------
 * tabTitle | group | siblingGroupFlag | skuList
 */

function normalizeKey(key = '') {
  return key
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();
}

function getCellText(cell) {
  return cell?.textContent.trim() || '';
}

function parseSettings(table) {
  const config = {};

  [...table.children].slice(1).forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) return;

    const key = normalizeKey(getCellText(cells[0]));
    const value = getCellText(cells[1]);

    config[key] = value;
  });

  return config;
}

function parseTabs(table) {
  const rows = [...table.children];

  if (rows.length <= 1) return [];

  const headers = [...rows[0].children].map((cell) =>
    normalizeKey(cell.textContent),
  );

  return rows.slice(1).map((row) => {
    const cells = [...row.children];

    const item = {};

    headers.forEach((header, index) => {
      item[header] = getCellText(cells[index]);
    });

    return {
      tabTitle: item.tabtitle || '',
      group: item.group || '',
      siblingGroupFlag: item.siblinggroupflag || 'N',
      skuList: item.skulist || '',
    };
  });
}

export function parseConfig(block) {
  const tables = [...block.children];

  if (tables.length < 2) {
    throw new Error(
      'Featured Products requires 2 tables (Config + Tabs).',
    );
  }

  const settings = parseSettings(tables[0]);

  const productList = parseTabs(tables[1]);

  return {
    title: settings.title || '',
    api: settings.api || '',
    bizType: settings.biztype || '',
    isMember: settings.ismember || 'N',
    subscribeProduct: settings.subscribeproduct || 'N',
    productList,
  };
}
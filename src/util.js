import Hetzner from './hetzner-api-controller.js'

export function getAPIKey(program) {
  const { apiKey } = program.opts();

  if (!apiKey) {
    return console.error('No API Key provided! Please provide an API Key as --api-key or -k argument');
  }
  return apiKey;
}

export async function getZoneFromQuery(zoneQuery, apiKey) {
  const client = new Hetzner(apiKey);

  const zones = await client.getAllZones(zoneQuery);
  if (zones.length == 0) {
    console.error(`Found no zone for the query "${ zoneQuery }"!`);
  }
  else if (zones.length > 1) {
    console.error(`Found more than one zone for the query "${ zoneQuery }"!`);
  }
  else {
    return zones[0];
  }
}


export async function getRecord(recordQuery, zoneQuery, apiKey) {
  const client = new Hetzner(apiKey);

  // If the record query is xxx:xxx syntax, use it as search query
  if (recordQuery.split(':').length == 2) {
    const zone = await getZoneFromQuery(zoneQuery, apiKey);
    const [ name, type ] = recordQuery.split(':');
    console.log(`\n🟡  Searching for records of with name "${ name }" and type ${ type }`);
    const { records } = await client.getAllRecords(zone.id);
    const matching = findMatchingRecords(records, name, type);
    if (matching.length == 0) {
      throw `Cannot find matching record.`;
    }
    else if (matching.length > 1) {
      throw `Found more than one matching record.`;
    }
    else {
      return matching[0];
    }
  }
  else {
    return (await client.getRecord(recordQuery)).record;
  }
}

export function findMatchingRecords(records, name, type) {
  return records.filter(record => {
    return (record.name.toUpperCase() == name.toUpperCase() || name == '') && (record.type.toUpperCase() == type.toUpperCase() || type == '');
  });
}

export function spaceText(text, n = 1) {
  return text.split('\n').map(line => '\t'.repeat(n) + line).join('\n');
}

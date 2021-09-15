export function zone(zone) {
  const { id, name, records_count, ttl } = zone;

  return `<${ name }@${ ttl } (${ id }) [${ records_count }]>`;
}

export function record(record) {
  const { type, name, value } = record;
  return `${ `${ name }:${ type }`.padStart(12, ' ') } = ${ value }`;
}

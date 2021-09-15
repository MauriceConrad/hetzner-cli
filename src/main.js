#!/usr/bin/env node

import { program } from 'commander'
import YAML from 'yaml'
import { printTable, Table } from 'console-table-printer'
import Hetzner from './hetzner-api-controller.js'
import * as stringifier from './stringifier.js'

import { spaceText, findMatchingRecords, getRecord, getZoneFromQuery, getAPIKey } from './util.js'


program.version('1.0.0');



program.option('-k, --api-key <apiKey>', 'Provide API Key')

//const dnsCmd = program.command('dns')//.option('-z, --zone <string>', 'Zone')

// Zone commands
{
  // Create zone command
  const cmd = program.command('zones');
  // Create get zone command
  const get = cmd.command('get [zone]')
    .action(async (zone) => {
      const client = new Hetzner(getAPIKey(program));

      const zones = await client.getAllZones(zone);

      const table = new Table({
        columns: [
          { name: 'id', alignment: 'right' },
          { name: 'name', alignment: 'right' },
          { name: 'ttl', alignment: 'right' },
          { name: 'status', alignment: 'right' },
          { name: 'records', alignment: 'right' }
        ]
      });
      table.addRows(zones.map(({ name, ttl, id, status, records_count }) => ({
        id,
        name,
        ttl,
        status,
        records: records_count
      })));
      table.printTable();

    });
  // Create uodate zone command
  const update = cmd.command('update [zone]')
    .option('-t, --ttl <number>', 'Global TTL for all records in zone')
    .option('-n, --name <string>', 'New zone name (dangerous!!!)')
    .action(async (zoneQuery) => {
      const client = new Hetzner(getAPIKey(program));

      const zone = await getZoneFromQuery(zoneQuery, getAPIKey(program));
      if (zone) {
        const updateDescriptor = {
          ttl: zone.ttl,
          name: zone.name,
          ...Object.fromEntries(Object.entries({
            ttl: Number(update.opts().ttl),
            name: update.opts().name
          }).filter(([ _, value ]) => value))
        };
        console.log(`\n🟡  Updating zone\n\t${ stringifier.zone(zone) } ➡`, updateDescriptor);

        try {
          const result = await client.updateZone(zone.id, updateDescriptor);
          console.log(`🟢  Zone updated\n\t${ stringifier.zone(result.zone) }`);
        }
        catch (err) {
          console.error(`\nCannot update zone`, err);
        }
      }

    });

    const create = cmd.command('create <zone>')
      .option('-t, --ttl <number>', "TTL new zone's records")
      .action(async (zoneName) => {
        const client = new Hetzner(getAPIKey(program));

        const { ttl } = create.opts();

        console.log(`\n🟡  Creating new zone ${ zoneName } with TTL ${ (ttl || 'DEFAULT') }`);
        try {
          const result = await client.createZone(zoneName, ttl);
          console.log(`🟢  Zone created succesfully\n\t${ stringifier.zone(result.zone) }`);
        }
        catch (err) {
          console.error(`\nCannot create zone`, err);
        }
      })

  const deleteCmd = cmd.command('delete <zone>')
    .action(async (zoneQuery)  => {
      const client = new Hetzner(getAPIKey(program));
      const zone = await getZoneFromQuery(zoneQuery, getAPIKey(program));
      if (zone) {
        console.log(`\n🟡  Deleting zone ${ stringifier.zone(zone) }`);
        try {
          client.deleteZone(zone.id);
          console.log(`🔴  Zone deleted succesfully\n\t${ stringifier.zone(zone) }`);
        }
        catch (err) {
          console.error(`\nCannot delete zone`, err);
        }
      }
    })

  const exportCmd = cmd.command('export <zone>')
    .action(async (zoneQuery) => {
      const client = new Hetzner(getAPIKey(program));
      const zone = await getZoneFromQuery(zoneQuery, getAPIKey(program));
      console.log(`\n🟡  Exporting zone file from ${ stringifier.zone(zone) }`);
      try {
        const result = await client.exportZoneFile(zone.id);
        console.log(`🟢  Zone exported succesfully`);
        console.log(spaceText(result));
      }
      catch (err) {
        console.error(`\nCannot export zone`, err);
      }
    })
}

// Record commands
{

  const cmd = program.command('records');
  cmd.option('-z, --zone <string>', 'Zone query for the record command');
  const get = cmd.command('get [record]')
    .action(async (record) => {
      const client = new Hetzner(getAPIKey(program));
      const zone = await getZoneFromQuery(cmd.opts().zone, getAPIKey(program));
      if (zone) {
        try {
          if (!record) record = ":";

          const [ name, type ] = record.split(':');
          console.log(`\n🟡  Searching for records of with name "${ name }" and type ${ type }`);
          const result = await client.getAllRecords(zone.id);
          const matching = findMatchingRecords(result.records, name, type);
          const table = new Table({
            columns: [
              { name: 'id', align: 'right' },
              { name: 'type', align: 'right' },
              { name: 'name', align: 'right' },
              { name: 'value', align: 'right', maxLen: 20 }
            ]
          });
          table.addRows(matching.map(({ id, type, name, value }) => ({ id, type, name, value })));
          table.printTable();


        }
        catch (err) {
          console.error(`Cannot find records`, err);
        }

      }
    })

  const update = cmd.command('update <record>')
    .option('-n, --name <string>', 'Name of record')
    .option('-t, --type <string>', 'Type of record')
    .option('-v, --value <string>', 'Value of record')
    .action(async (recordQuery) => {
      const client = new Hetzner(getAPIKey(program));

      try {
        const record = await getRecord(recordQuery, cmd.opts().zone, getAPIKey(program));
        try {
          const result = await client.updateRecord(record.id, {
            name: record.name,
            type: record.type,
            value: record.value,
            zone_id: record.zone_id,
            ...Object.fromEntries(Object.entries(update.opts()).filter(([ _, value ]) => value))
          });

          console.log(result.record);
          console.log("succesfully updated record '" + result.record.id + "'");
        }
        catch (err) {
          throw err;
        }
      }
      catch (err) {
        return console.error(err);
      }

    })


  const create = cmd.command('create <record> <value>').
    action(async (recordQuery, value) => {
      const client = new Hetzner(getAPIKey(program));
      const zone = await getZoneFromQuery(cmd.opts().zone, getAPIKey(program));


      const [ name, type ] = recordQuery.split(':');
      try {
        const result = await client.createRecord(zone.id, { name, type, value });
        console.log(result.record);
      }
      catch (err) {
        console.error(`Cannot create record`, err);
      }
    })

  const deleteCmd = cmd.command('delete <record>')
    .action(async (recordQuery) => {
      const client = new Hetzner(getAPIKey(program));
      try {
        const record = await getRecord(recordQuery, cmd.opts().zone, getAPIKey(program));
        const result = await client.deleteRecord(record.id);
        console.log("Successfully deleted record");
      }
      catch (err) {
        console.error(err);
      }
    })
}



program.parse();

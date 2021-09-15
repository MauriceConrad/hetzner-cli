# Hetzner CLI

### Usage

#### Global Installation

```bash
$ npm install hetzner -g
```

On top level, the CLI needs the `--api-key` argument.

```bash
$ hetzner --api-key XXX ...
```


### Example with zones

```bash
$ hetzner --api-key XXX zones get bluepic.de
```

## Zones

### Get zones

```bash
# Get all zones
$ zones get

# Get all zones that are matching the phrase 'blue'
$ zones get blue

# Get all zones that are matching exactly bluepic.de
$ zones get bluepic.de
```


### Update zone

|Argument|Type  |Description       |Required|
|--------|:-----|:-----------------|-------:|
| `--ttl`|Number|Current zone TTL  |      No|

```bash
# Updates TTL of zone bluepic.de to 300
$ zones update bluepic.de --ttl 300
```

### Create Zone

|Argument|Type  |Description       |Required|
|--------|:-----|:-----------------|-------:|
| `--ttl`|Number|New zone's TTL    |      No|

```bash
# Creates new zone example.com with TTL 3600
$ zones create example.com --ttl 3600
```

### Delete Zone

```bash
# Deletes zone example.com
$ zones delete example.com
```

### Export Zone

```bash
# Export zone bluepic.de
$ zones export bluepic.de
```


## Records

|Argument|Type  |Description       |Required|
|--------|:-----|:-----------------|-------:|
|`--zone`|String|Current zone query|      No|

### Addressing records

Internally, Hetzner's records are related to unqiue ids as zones described above. When using this CLI, you can either address them by their unique id but also by the following search query `www:AAAA`. In combination with the `--zone` argument, this makes using this CLI much more easy because you do not have to write down a record's id before addressing it. For security reasons, this will not work if you call `update` and there are more than one matching records. Normally, this only happens if you're using the query syntax as `:AAAA` (which points to all type `AAAA` records in the `--zone`) or as `www:` (which points to all `www` records in the `--zone`). If you're specifying *type* **and** *type*, two matching records would mean that your DNS records are ambiguous.

### Find records

```bash
# Find all www records
$ records --zone bluepic.de get www:

# Find all records of type AAAA
$ records --zone bluepic.de get :AAAA

# Find all www records of type AAAA (Should only return one)
$ records --zone bluepic.de get www:AAAA

# Find all records of any type
$ records --zone bluepic.de get :
```

### Update record

|Argument|Type   |Description           |Required|
|--------:|:-----|:---------------------|-------:|
| `--name`|String|Record's updated name |      No|
| `--type`|String|Record's updated type |      No|
|`--value`|String|Record's updated value|      No|


#### By query

```bash
# Updates A type record's IPv4 address
$ records --zone bluepic.de update www:a --value 127.0.0.1

# Updates A type record's name from 'www' to 'sub'
$ records --zone bluepic.de update www:a --name sub
# This is will make pointing sub.bluepic.de to the IPv4, www.bluepic.de pointed before

# Tries to a A type record to type AAAA without updating the value to a valid IPv6 address
$ records --zone bluepic.de update www:a --type AAAA # this will fail
```


#### By id

If you know your record's unique id, you can also pass it instead of the query `xxx:xxx`

```bash
# Updates the IPv4 value of a record withe id XXXXXXXXXXXXXXXXX
# As you can see you do not have to give the zone as an argument, which is more performant
$ records update XXXXXXXXXXXXXXXXX --value 127.0.0.1
```

### Create record

#### By query

```bash
# Creates a A type 'www' record in zone bluepic.de
$ records --zone bluepic.de create www:A 172.0.0.1
```


### Delete record

#### By query

```bash
# Deletes the A type 'www' record
$ records --zone bluepic.de delete www:a
```

#### By id

```bash
# Deletes the specific record with the id XXXXXXXXXXXXXXX
$ records delete XXXXXXXXXXXXXXX
```

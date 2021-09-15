import axios from 'axios'

export default class Hetzner {
  static baseUrl = 'https://dns.hetzner.com/api/v1/'
  apiKey = null
  constructor(apiKey) {
    this.apiKey = apiKey
  }
  async getAllZones(zoneName) {
    let allZones = [];
    let pages = 1;
    for (let page = 0; page < pages; page++) {
      const result = await Hetzner.getAllZonesByPage(page, 100, zoneName, this.apiKey);
      if (result.error) {
        return [];
      }
      const { zones, meta } = await Hetzner.getAllZonesByPage(page, 100, zoneName, this.apiKey);
      pages = Math.ceil(meta.pagination.total_entries / meta.pagination.per_page);
      allZones = allZones.concat(zones);
    }
    return allZones;
  }
  async updateZone(zoneId, updateDescriptor) {
    const endpoint = Hetzner.getEndpoint('zones', zoneId);
    try {
      const response = await axios.put(endpoint, updateDescriptor, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async createZone(name, ttl) {
    const endpoint = Hetzner.getEndpoint('zones');
    try {
      const response = await axios.post(endpoint, { name, ttl }, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async deleteZone(zoneId) {
    const endpoint = Hetzner.getEndpoint('zones', zoneId);
    try {
      const response = await axios.delete(endpoint, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async exportZoneFile(zoneId) {
    const endpoint = Hetzner.getEndpoint('zones', zoneId, 'export');
    try {
      const response = await axios.get(endpoint, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async getAllRecords(zone_id) {
    const endpoint = Hetzner.getEndpoint('records');
    const queryParamsStr = new URLSearchParams({ zone_id }).toString();
    try {
      const response = await axios.get(`${ endpoint }?${ queryParamsStr }`, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async getRecord(id) {
    const endpoint = Hetzner.getEndpoint('records', id);
    try {
      const response = await axios.get(endpoint, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async updateRecord(id, updateDescriptor) {
    const endpoint = Hetzner.getEndpoint('records', id);
    try {
      const response = await axios.put(endpoint, updateDescriptor, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async createRecord(zone_id, creationDescriptor) {
    const endpoint = Hetzner.getEndpoint('records');
    try {
      const response = await axios.post(endpoint, {
        ...creationDescriptor,
        zone_id
      }, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  async deleteRecord(id) {
    const endpoint = Hetzner.getEndpoint('records', id);
    try {
      const response = await axios.delete(endpoint, {
        headers: { 'Auth-API-Token': this.apiKey }
      });
      return response.data;
    } catch ({ response }) {
      throw response.data.error;
    }
  }
  static getEndpoint(...args) {
    return this.baseUrl + args.join('/');

  }
  static async getAllZonesByPage(pagem, per_page, search_name, apiKey) {
    const endpoint = this.getEndpoint('zones');
    const queryParamsStr = new URLSearchParams(Object.fromEntries(Object.entries({ page: 1, per_page, search_name }).filter(([ _, value ]) => value))).toString();
    const url = `${ endpoint }?${ queryParamsStr }`;
    try {
      const response = await axios.get(url, {
        headers: { 'Auth-API-Token': apiKey }
      });
      return response.data;
    }
    catch ({ response }) {
      return response.data;
    }
  }
}

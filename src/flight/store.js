import dataStore from 'nedb-promise';

export class FLightStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    console.log(props)
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(flight) {
    console.log("insert");
    return this.store.insert(flight);
  };
  
  async update(props, flight) {
    console.log("update");
    return this.store.update(props, flight);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new FLightStore({ filename: './db/flights.json', autoload: true });
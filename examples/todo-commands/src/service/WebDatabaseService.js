class WebDatabaseService {
  delete(key) {
    console.log(`> StaticDatabaseService -> delete: ${key}`);
    window.localStorage.remove(key);
  }
  exist(key) {
    const result = !!window.localStorage.containsKey(key);
    console.log(`> WebDatabaseService -> exist: ${key} = ${result}`);
    return result;
  }
  init(key) {
    console.log(`> StaticDatabaseService -> init: ${key}`);
    return Promise.resolve(true);
  }
  retrieve(key) {
    const value = window.localStorage[key];
    console.log(`> WebDatabaseService -> retrieve: ${key}`);
    return Promise.resolve(value != null ? JSON.parse(value) : null);
  }
  save(key, data) {
    console.log('> WebDatabaseService -> save: $key = $data');
    window.localStorage[key] = JSON.stringify(data);
  }
}

export default WebDatabaseService;

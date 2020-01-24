function expectJson(response) {
  return response.json().then(data => {
    if (!response.ok) {
      if (data && data.message) {
        if (data.message instanceof Object) {
          throw new Error(JSON.stringify(data.message));
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error(response.statusText);
      }
    }
    return data;
  });
}

export { expectJson };

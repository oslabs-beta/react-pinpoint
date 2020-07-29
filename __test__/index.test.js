const names = require('../src/index');

describe('all names test', () => {
  it('expects Robbie, Jeffie, Mattie, Taie, and Shane Allan in the array', () => {
    expect(['Robbie', 'Jeffie', 'Mattie', 'Taie', 'Shane Allan']).toEqual(expect.arrayContaining(names.all));
  });
});

// const React = require('react');
import React from 'react';
const TestRenderer = require('react-test-renderer');
const names = require('../index');
const { mountToReactRoot, getAllSlowComponentRenders, getCircularReplacer } = require('../utils/utils');

describe('all names test', () => {
  it('expects Robbie, Jeffie, Mattie, Taie, and Shane Allan in the array', () => {
    expect(['Robbie', 'Jeffie', 'Mattie', 'Taie', 'Shane Allan']).toEqual(expect.arrayContaining(names.all));
  });
});

function Link(props) {
  return <a href={props.page}>{props.children}</a>;
}

describe('getAllSlowComponentRenders function', () => {
  it('should get the slow component renders', () => {
    const testRenderer = TestRenderer.create(<Link page="https://www.facebook.com/">Facebook</Link>);
    testRenderer.root._fiber.selfBaseDuration = 15; // fake render time in milliseconds
    const testFiberArray = [JSON.stringify(testRenderer.root._fiber, getCircularReplacer())];

    expect(getAllSlowComponentRenders(14, testFiberArray)).toHaveLength(1);
  });
});

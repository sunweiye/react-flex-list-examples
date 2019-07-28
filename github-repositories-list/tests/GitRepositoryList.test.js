import React from 'react';
import {GitRepositoryListComponent} from '../GitRepositoryList';
import renderer from 'react-test-renderer';

test('Render the public repositories', () => {
    //@todo: The mock for async request
    const component = renderer.create(
        <GitRepositoryListComponent pageSize={10} />,
    );
    // let tree = component.toJSON();
    // expect(tree).toMatchSnapshot();
});

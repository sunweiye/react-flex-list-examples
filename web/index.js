import React from 'react';
import ReactDOM from 'react-dom';
import {GitRepositoryListComponent} from "../github-repositories-list/GitRepositoryList";

const renderFilterList = () => {
    ReactDOM.render(<GitRepositoryListComponent pageSize={10}/>, document.getElementById('list-app'));
};

renderFilterList();

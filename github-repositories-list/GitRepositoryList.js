import 'regenerator-runtime/runtime';
import React, {Component} from 'react';
import Form from 'react-jsonschema-form';
import {SimpleFlexList} from 'react-flex-list';

import githubApi from './ApiRequest';

const searchForm = require('./form/searchForm');

const githubActionTexts = {
    stargazer: 'Star',
    watcher: 'Watch',
    fork: 'Fork',
};

const renderRepositoryItem = (index, item) => {
    return (
        <li className='border border-bottom-0 border-left-0 border-right-0 border-muted d-flex flex-column flex-md-row flex-justify-start py-4' key={'repo--' + index}>
            <div className='col-12 col-md-8'>
                <h3><a className='v-align-middle' href={item.html_url} target='_blank'>{item.full_name}</a></h3>
                <p className='col-12 col-md-9 d-inline-block text-gray mb-2 pr-4'>{item.description}</p>
                <p className='col-12 col-md-9 d-inline-block text-gray mb-2 pr-4'>
                    Owned by <a href={item.owner.html_url} target='_blank'>{item.owner.login}</a>
                </p>
            </div>
            <div className='col-6 col-md-4 pt-2 pr-md-3 d-flex justify-content-between'>
                <div className='text-gray flex-auto min-width-0'>
                    {item.language ? <p className='text-gray flex-auto min-width-0'>{item.language}</p> :''}
                </div>
                <div className='pl-2 pl-md-0 text-right flex-auto min-width-0'>
                    {
                        ['stargazer', 'watcher', 'fork'].map(key => {
                            let field = key + 's_count';
                            return item[field] === undefined ? '' : <span key={key} className={'d-block ' + key}>{githubActionTexts[key]}: {item[field]}</span>
                        })
                    }
                </div>
            </div>
        </li>
    );
};


class GitRepositoryListComponent extends Component {
    static getAllowedRepositoriesAmount(amount) {
        let maxAllowedRepositoriesOfGithub = 1000;
        return amount > maxAllowedRepositoriesOfGithub ? maxAllowedRepositoriesOfGithub : amount;
    }

    constructor(props) {
        super(props);
        this.pageSize = this.props.pageSize ? this.props.pageSize : 10;
        this.formSettings = {
            disable: true
        };
        this.list = null;

        this.state = {
            formData: {},
            listInitialized: false,
            repositories: [],
            keyword: this.props.keyword,
            totalResults: 0,
            filtersData: {},
            since: 0,
            currentPage: 0
        };
    }

    _loadRepositories = (page = 0) => {
        let query = {
            pageNumber: page,
            perPage: this.pageSize,
            keyword: this.state.keyword
        };

        if(this.state.formData.sort) {
            let sortSettings = this.state.formData.sort.split(':');
            query.sort = sortSettings[0];
            query.orderBy = sortSettings[1];
        }

        return githubApi.getRepositories(query);
    };

    _loadNextAnotherRepositories = () => {
        this._loadRepositories(this.state.since).then(repositories => this.setState({
                repositories: repositories.slice(0, 10),
                since: repositories[9].id,
                totalResults: 0
            })
        );
    };

    _paginateRepositories = (page) => {
        return this._loadRepositories(page + 1).then(({repositories}) => {
            this.setState({currentPage: page});
            return repositories
        });
    };

    _searchRepositories = formData => {
        let keyword = null;
        if (typeof formData.search === 'string') {
            formData.search = formData.search.trim();
            keyword = formData.search.length > 0 ? formData.search : null;
        }
        this.list.setState({
            paginationSettings: {}
        });

        this.setState(
            {
                formData,
                keyword
            },
            () =>
                this.state.keyword ?
                    this._loadRepositories(1, false).then(({total, repositories}) =>
                            this.setState({
                                repositories,
                                totalResults: total
                            })
                    ) : this._loadNextAnotherRepositories()
        );
    };

    componentDidMount() {
        this._loadNextAnotherRepositories();
    }

    render() {
        let listContainerSettings = {
                className: 'repositories-list',
                children: this.state.totalResults ? (
                    <div className='text-muted py-2'>Find {this.state.totalResults} repositories. But only the first 1000 search results are available according to the <a className='link' href='https://developer.github.com/v3/search/' target='_blank'>restriction of github</a></div>
                ) : (
                    <div className='d-flex justify-content-center'>
                        <button
                            onClick={this._loadNextAnotherRepositories}
                            className='btn btn-primary px-4'>
                            Load another {this.pageSize} repositories
                        </button>
                    </div>
                ),
                childrenBeforeList: this.state.totalResults > 0,
                listClassName: 'p-0',
                emptyListContent: (
                    <div className='text-center py-5'>No repository found</div>
                )
            },
            paginationSettings = {
                pageCount: Math.ceil(GitRepositoryListComponent.getAllowedRepositoriesAmount(this.state.totalResults) / this.pageSize),
                containerClassName: 'pagination justify-content-center',
                pageClassName: 'page-item',
                pageLinkClassName: 'page-link',
                activeClassName: 'active',
                disabledClassName: 'd-none',
                previousClassName: 'page-item prev',
                previousLinkClassName: 'page-link',
                nextClassName: 'page-item next',
                nextLinkClassName: 'page-link',
                initialPage: 0
            };

        if(this.state.currentPage === 0) {
            paginationSettings.forcePage = 0;
        }
        return <div>
            <Form {...searchForm} formData={this.state.formData} onSubmit={({formData}) => this._searchRepositories(formData)}>
                <div><button className='btn btn-info' type='submit'>Search</button></div>
            </Form>
            <SimpleFlexList
                listData={this.state.repositories}
                listContainerSettings={listContainerSettings}
                searchForm={this.formSettings}
                renderItem={renderRepositoryItem}
                asyncDataLoader={this._paginateRepositories}
                pageSize={this.pageSize}
                paginationSettings={paginationSettings}
                className='mb-4'
                ref={list => this.list = list}
            />
        </div>
    }
}

export {GitRepositoryListComponent};

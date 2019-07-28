class GitHubApiRequest {
    static _isEmptyString(input) {
        return input === undefined || input === null || typeof input !== 'string' || input.trim().length === 0;
    }

    _request = (endPoint) => {
        if(typeof endPoint !== 'string') {
            throw new Error("The end point must be a string.");
        }

        endPoint = endPoint.replace(/^\/+|\/+$/g, '');
        if(endPoint.length === 0) {
            throw new Error("The end point must be be a valid string.");
        }

        return fetch(`https://api.github.com/${endPoint}`)
            .then(response => response.text())
            .then(response => JSON.parse(response))
            .catch((err) => {
                console.error(err.message);
                return [];
            })
    };

    _getPublicRepositoriesList = (since) => {
        since = (since === undefined || since === null) ? 0 : since;
        return this._request(`repositories?since=${since}`);
    };

    _getSearchedRepositoriesList = (keyword, pageNumber = 0, perPage = 10, sort = null, orderBy = 'desc') => {
        keyword = keyword.trim().replace(/ +/g, '+').split('+').map(item => encodeURIComponent(item)).join('+');
        let endPoint = `search/repositories?q=${keyword}&page=${pageNumber}&per_page=${perPage}`;
        if(sort) {
            endPoint += `&sort=${sort}&order=${orderBy}`;
        }
        return this._request(endPoint)
            .then(({total_count, items}) => {
                return {
                    total: total_count,
                    repositories: items
                }
            });
    };

    getRepositories = ({keyword, pageNumber, perPage, sort, orderBy}) => {
        return GitHubApiRequest._isEmptyString(keyword) ? this._getPublicRepositoriesList(pageNumber) : this._getSearchedRepositoriesList(keyword, pageNumber, perPage, sort, orderBy);
    }
}

const githubApi = new GitHubApiRequest();
Object.freeze(githubApi);

export default githubApi;

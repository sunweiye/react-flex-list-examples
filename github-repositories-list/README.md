## An example to show the github repositories

In this example, the `SimpleFlexList` is used and with an asynchronous method, which loads the repositories' data with
Github APIs.

### Components
##### Search Form
The search form uses [`react-jsonschema-form`](https://github.com/mozilla-services/react-jsonschema-form) with a required
search field and a drop down for the sorting.

##### The list content and pagination
- If the search field is empty, the [list all public repositories API](https://developer.github.com/v3/repos/#list-all-public-repositories)
will be called, and the pagination will be showed as a single button to load another more repositories. Because this api
doesn't return the count of starts, forks and watchers and the repository language, therefore, these information won't be shown.

- If the search field is not empty, the [search API](https://developer.github.com/v3/search/) will be used, and a pagination
will be shown.
    * Pagination, if there are more than 10 repositories
    * Maximal 100 pages (1000 entries), because of the restriction of this API.

- By the repository item, the following information is shown:
    - The full name of the repository incl. a link to the repository to github
    - The programming language of the project, if available
    - The name of the owner incl. a link to the github owners’ profile
    - The number of stars, forks, watchers

### Notation
- The list data by each fetching from Github will simply saved in the react component state. The redux is not be used. And
by every change of the search or pagination, the data will be fetched, even if the data has been required before.
- The API for listing all public repository doesn't support the page size settings. Therefore, in the list, only the first
amount of the list size will be shown, all others (the full result contains 300 entries) will be dropped.  

const elasticsearch = require('elasticsearch');
const Rx = require('rxjs');

//const client = new elasticsearch.Client({ host: '10.129.192.146:9200' });
const client = new elasticsearch.Client({ host: '10.240.4.115:9200' });

const timeRange = (start, end) => ({
  range: {
    '@timestamp': {
      gte: start,
      le: end,
      format: 'epoch_millis',
    },
  },
});

const queryString = query => ({
  query_string: {
    query,
    analyze_wildcard: true,
  },
});

const sort = [
  {
    '@timestamp': {
      order: 'asc',
      unmapped_type: 'boolean',
    },
  },
];

const scroll = (scrollId, getMoreUntilDone) => {
  client.scroll(
    {
      scrollId,
      scroll: '20s',
    },
    getMoreUntilDone,
  );
};

const QUERY =
  'message.keyword: /Request on \\/login\\/auth\\/(otp|email|session|cpf) Received/ || message: "Request on /menu/home Finished with status 302"';

function createSearchObject(start, end) {
  return {
    index: 'logs-*',
    scroll: '20s',
    size: process.env.NODE_ENV === 'prod' ? 10000 : 500,
    body: {
      sort,
      query: {
        bool: {
          must: [queryString(QUERY), timeRange(start, end)],
        },
      },
    },
  };
}

function createObservable(searchObject, observer) {
  client.search(searchObject, function getMoreUntilDone(error, resp) {
    if (error) {
      console.error(JSON.stringify(error));
      observer.error(error);
      return;
    }
    console.log('.');
    if (resp.hits.hits.length > 0) {
      resp.hits.hits.map(hit => observer.next(hit));
      scroll(resp._scroll_id, getMoreUntilDone);
    } else {
      observer.complete();
    }
  });
}

function findDocuments(dtStart, dtEnd) {
  const searchObject = createSearchObject(dtStart, dtEnd);
  return Rx.Observable.create(observer => createObservable(searchObject, observer));
}

module.exports = findDocuments;

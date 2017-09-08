const PriorityQueue = require('fastpriorityqueue');
const Promise = require('bluebird');

const calculateRank = require('./rank');

const typeScore = {
  session: 5,
  otp: 3,
  cpf: 1,
  email: 1,
};

const timestampInMinutes = timestamp => Math.floor(timestamp / 60000);

const packObject = obj => [typeScore[obj.type], timestampInMinutes(obj.timestamp), obj.ok ? 1 : 0];

function getIdList(priorityQueue) {
  const result = [];
  while (!priorityQueue.isEmpty()) {
    result.push(priorityQueue.poll());
  }
  return result;
}

function classifyFromMap(map, maxItems) {
  const priorityQueue = new PriorityQueue((a, b) => a[1] < b[1]);
  for (const id of Object.keys(map)) {
    priorityQueue.add([id, calculateRank(map[id])]);
    if (priorityQueue.size > maxItems) priorityQueue.poll();
  }
  return getIdList(priorityQueue);
}

function classify(observable, maxItems) {
  console.log('[Classifier] Classification initiated.');
  const map = Object.create(null);
  const value = id => map[id] || (map[id] = []);

  return new Promise((resolve, reject) => {
    const onData = data => value(data.id).push(packObject(data));
    const onError = error => reject(error);
    const onComplete = () => resolve(classifyFromMap(map, maxItems));

    observable.subscribe(onData, onError, onComplete);
  });
}

module.exports = classify;

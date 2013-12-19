define([
  'extensions/collections/matrix',
  'extensions/collections/collection',
  'extensions/models/group'
],
function (MatrixCollection, Collection, Group) {

  var CompletionCollection = MatrixCollection.extend({
    model: Group,

    initialize: function (models, options) {
      this.startMatcher= options.startMatcher;
      this.endMatcher= options.endMatcher;
      this.matchingAttribute= options.matchingAttribute || 'eventCategory';
      this.valueAttribute= options.valueAttribute || 'uniqueEvents';
      MatrixCollection.prototype.initialize.apply(this, arguments);
      this.query.set('period', 'week', {silent: true, utc: false});
      delete this.query.attributes.period;
    },

    uniqueEventsFor: function (data, matcher) {
      var events = _.filter(data, function (d) {
        return d[this.matchingAttribute].match(matcher) !== null;
      }, this);

      if (events.length === 0) {
        return 0;
      }

      return _.reduce(events, function (mem, d) { 
        return mem + d[this.valueAttribute]; 
      }, 0, this);
    },

    findCompletion: function (event) {
      var completion = null;

      if (event != null) {
        completion = event.totalCompleted / event.totalStarted;
      }
      return completion;
    },

    getEventForTimestamp: function (events, timestamp) {
      return _.find(events, function (d) {
        return this.getMoment(d._timestamp).isSame(timestamp);
      }, this);
    },

    eventsFrom: function (data) {
      var eventsByTimestamp = _.groupBy(data, function (d) { return d._timestamp; });

      return _.map(eventsByTimestamp, function (events) {
        return {
          _timestamp: events[0]._week_start_at,
          totalStarted: this.uniqueEventsFor(events, this.startMatcher),
          totalCompleted: this.uniqueEventsFor(events, this.endMatcher)
        };
      }, this);
    },

    numberOfJourneyStarts: function () {
      var data = this.data;
      return this.uniqueEventsFor(data, this.startMatcher);
    },

    numberOfJourneyCompletions: function () {
      var data = this.data;
      return this.uniqueEventsFor(data, this.endMatcher);
    },

    completionRate: function () {
      return this.numberOfJourneyCompletions() / this.numberOfJourneyStarts();
    },

    series: function (config) {
      var data = this.data;
      var events = this.eventsFrom(data);

      var weeksWithData = events.length;

      var earliestEventTimestamp = this.earliest(events, function (d) {
        return this.getMoment(d._timestamp);
      });
      var latestEventTimestamp = this.latest(events, function (d) {
        return this.getMoment(d._timestamp);
      });
      var weekDates = this.weeksFrom(latestEventTimestamp, 9);

      var values = _.map(weekDates, function (timestamp) {
        var existingEvent = this.getEventForTimestamp(events, timestamp);
        return _.extend(config.modelAttribute(existingEvent), {
          _start_at: timestamp.clone(),
          _end_at: timestamp.clone().add(1, 'weeks')
        });
      }, this);

      return _.extend(config.collectionAttribute(events), {
        id: config.id,
        title: config.title,
        weeks: {
          total: this.numberOfWeeksInPeriod(earliestEventTimestamp, latestEventTimestamp) + 1,
          available: weeksWithData
        },
        values: new Collection(values).models
      });
    }
  });

  return CompletionCollection;
});

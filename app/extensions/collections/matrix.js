define([
  'require',
  './collection',
  'extensions/models/group'
],
function (require, Collection, Group) {
  /**
   * Helper class. Graphs expect a collection of `Group` models, each of which
   * containing a data series. This collection combines one or more single
   * data series into a Graph-compatible collection of collections.
   */
  var MatrixCollection = Collection.extend({
    model: Group,
    
    initialize: function () {
      Collection.prototype.initialize.apply(this, arguments);
      
      this.on('reset', function () {
        this.each(function (group, groupIndex) {
          group.get('values').on('change:selected', function (model, index) {
            this.onGroupChangeSelected(group, groupIndex, model, index);
          }, this);
        }, this);
      }, this);
    },
    
    parse: function (data) {
      return _.map(this.collectionInstances, function (collection) {
        return {
          id: collection.id,
          title: collection.title,
          values: collection.models
        };
      });
    },
    
    /**
     * Chooses an item in the collection as `selected` and notifies listeners.
     * @param {Number} groupIndex Index of group to select, or `null` to unselect
     * @param {Number} index Index of item in group to select, or `null` to unselect
     * @param {Object} [options={}] Options
     * @param {Boolean} [options.silent=false] Suppress `change:selected` event
     * @param {Boolean} [options.toggle=false] Unselect if selection is unchanged
     */
    selectItem: function (selectGroupIndex, selectIndex, options) {
      options = _.extend({}, options);
      if (_.isUndefined(selectIndex)) {
        selectIndex = null;
      }

      this.selectedSlice = null;
      
      var toggled = false;
      this.each(function (group, groupIndex) {
        var values = group.get('values');
        var index = null;
        if (selectGroupIndex == null || selectGroupIndex === groupIndex) {
          if (options.toggle && values.selectedIndex === selectIndex) {
            toggled = true;
          } else {
            index = selectIndex;
          }
        }
        values.selectItem(index, { silent: true });
      }, this);

      if (toggled) {
        selectGroupIndex = null;
        selectIndex = null;
      }
      
      var selectGroup = this.at(selectGroupIndex) || null;
      var selectModel = null;
      if (selectIndex != null) {
        if (selectGroup) {
          selectModel = selectGroup.get('values').at(selectIndex);
        } else {
          selectModel = this.map(function (group) {
            return group.get('values').at(selectIndex);
          });
          this.selectedSlice = selectIndex;
        }
      }
      
      Collection.prototype.selectItem.call(this, selectGroupIndex, { silent: true });
      
      if (!options.silent) {
        this.trigger('change:selected', selectGroup, selectGroupIndex, selectModel, selectIndex);
      }
    },

    getCurrentSelection: function () {
      var res = {
        selectedGroupIndex: this.selectedIndex,
        selectedGroup: this.selectedItem,
        selectedModelIndex: null,
        selectedModel: null
      };

      if (this.selectedItem) {
        var groupValues = this.selectedItem.get('values');
        if (groupValues.selectedItem) {
          _.extend(res, {
            selectedModelIndex: groupValues.selectedIndex,
            selectedModel: groupValues.selectedItem
          });
        }
      } else if (this.selectedSlice != null) {
        var selectedSlice = this.selectedSlice;
        return {
          selectedGroupIndex: null,
          selectedGroup: null,
          selectedModelIndex: selectedSlice,
          selectedModel: this.map(function (group) {
            return group.get('values').at(selectedSlice);
          })
        };
      }

      return res;
    },

    at: function (groupIndex, index) {
      if (index != null) {
        return this.at(groupIndex).get('values').at(index);
      } else {
        return Collection.prototype.at.call(this, groupIndex);
      }
    },

    groupSum: function (attr, index) {
      return this.at(index).get('values').reduce(function (memo, model) {
        var value = model.get(attr);
        if (_.isNumber(value)) {
          memo += value;
        }
        return memo;
      }, null);
    },

    itemSum: function (attr, index) {
      return this.reduce(function (memo, group) {
        var value = group.get('values').at(index).get(attr);
        if (_.isNumber(value)) {
          memo += value;
        }
        return memo;
      }, null);
    },
    
    sum: function (attr, groupIndex, index) {
      if (groupIndex != null && index != null) {
        return this.at(groupIndex, index).get(attr);
      } else if (groupIndex != null) {
        return this.groupSum(attr, groupIndex);
      } else if (index != null) {
        return this.itemSum(attr, index);
      } else {
        return this.reduce(function (memo, group, groupIndex) {
          var groupSum = this.groupSum(attr, groupIndex);
          if (_.isNumber(groupSum)) {
            memo += groupSum;
          }
          return memo;
        }, null, this);
      }
    },

    fraction: function (attr, groupIndex, index) {
      if (groupIndex != null && index != null) {
        var itemSum = this.sum(attr, null, index);
        var value = this.at(groupIndex, index).get(attr) || 0;
        return value / itemSum;
      } else if (groupIndex != null) {
        return this.sum(attr, groupIndex) / this.sum(attr);
      } else if (index != null) {
        return this.sum(attr, null, index) / this.sum(attr);
      } else {
        return 1;
      }
    },
    
    onGroupChangeSelected: function (group, groupIndex, model, index) {
      if (index === null) {
        group = null;
        groupIndex = null;
      }
      this.trigger('change:selected', group, groupIndex, model, index);
    }
  });
  
  return MatrixCollection;
});



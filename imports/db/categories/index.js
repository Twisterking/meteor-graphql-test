import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


export const Categories = new Mongo.Collection('categories');

if(Meteor.isServer) {
	Meteor.startup(() => {
		Categories._ensureIndex({
      '_id': 1,
      'supplier_id': 1,
      'alias': 1,
      'meta': 1
    });
    Categories._ensureIndex({
      'supplier_id': 1,
      'meta.name': 1
    });
    Categories._ensureIndex({
      'supplier_id': 1,
      'meta.code': 1
    });
	});
}

Categories.schema = new SimpleSchema({
	name: {
		type: String,
		label: "Category Name",
		min: 1,
		max: 99
	},
	alias: {
		type: String,
		label: "Category Alias",
		min: 1,
		max: 99
	},
	supplier_id: {
    type: String,
    label: "Supplier Id",
    min: 17,
    max: 17
  },
  _parent: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
	meta: {
		type: Object,
		label: "Supplier Category Metadata",
    optional: true,
    blackbox: true
	}
});

Categories.attachSchema(Categories.schema);
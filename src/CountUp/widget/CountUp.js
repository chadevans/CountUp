/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document, CountUp */
/*mendix */
/*
    CountUp
    ========================

    @file      : CountUp.js
    @version   : 1.0
    @author    : Chad Evans
    @date      : 19 Aug 2015
    @copyright : 2015, Mendix B.v.
    @license   : Apache v2

    Documentation
    ========================
    Provides an animation to a display of numerical data.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style',
    'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text', 'dojo/html', 'dojo/_base/event',
    'CountUp/lib/countUp', 'dojo/text!CountUp/widget/template/CountUp.html'
], function (declare, _WidgetBase, _TemplatedMixin,
    dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle,
    domConstruct, dojoArray, lang, text, html, event,
    _countUp, widgetTemplate) {
    'use strict';

    // Declare widget's prototype.
    return declare('CountUp.widget.CountUp', [_WidgetBase, _TemplatedMixin], {

        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        displayAttribute: "",
        useGrouping: true,
        useEasing: true,
        decimals: 0,
        duration: 2.0,
        prefix: "",
        suffix: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _lastValue: 0,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            //console.log(this.id + '.postCreate');
            
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            //console.log(this.id + '.update');

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {},

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {},

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {},

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {},

        // Rerender the interface.
        _updateRendering: function () {
            if (this._contextObj !== null) {
                domStyle.set(this.domNode, 'display', 'block');
                
                var demo,
                    options = {
                        useGrouping: this.useGrouping,
                        useEasing: this.useEasing,
                        prefix: this.prefix,
                        suffix: this.suffix
                    },
                    start = this._lastValue,
                    end = this._contextObj.get(this.displayAttribute);
                
                // save the value for the next run
                this._lastValue = end;
                
                demo = new _countUp(this.textNode, start, end, this.decimals, this.duration, options);
                demo.start();
            } else {
                domStyle.set(this.domNode, 'display', 'none');
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            var _objectHandle = null,
                _attrHandle = null;

            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle, i) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions. 
            if (this._contextObj) {

                _objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                _attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.displayAttribute,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this._handles = [_objectHandle, _attrHandle];
            }
        }
    });
});
require(['CountUp/widget/CountUp'], function () {
    'use strict';
});
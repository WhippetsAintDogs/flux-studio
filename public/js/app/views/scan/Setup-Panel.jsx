define([
    'jquery',
    'react',
    'helpers/api/config',
    'jsx!widgets/List',
    'jsx!widgets/Dialog-Menu'
], function($, React, config, List, DialogMenu) {
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                className: {},
                lang: {},
                getSetting: function(setting) {},
                onCalibrate: function() {}
            };
        },

        getInitialState: function() {
            var defaultSettings = {
                    resolution: this.props.lang.scan.resolution[0]
                },
                defaults = config().read('scan-defaults') || defaultSettings;

            return {
                defaults: defaults
            };
        },

        openSubPopup: function(e) {
            this.refs.dialogMenu.toggleSubPopup(e);
        },

        getSettings: function() {
            return this.state.defaults;
        },

        _onPickupResolution: function(e) {
            var $me = $(e.target).parents('li'),
                settings = {
                    resolution: $me.data('meta')
                };

            this.props.getSetting(settings);

            config().write('scan-defaults', settings);

            this.setState({
                defaults: settings
            });

            this.openSubPopup(e);
        },

        _getResolutionOptions: function(lang) {
            var resolution = JSON.parse(JSON.stringify(lang.scan.resolution)),
                options = [];

            resolution.forEach(function(opt, i) {
                options.push({
                    data: opt,
                    label: (
                        <div className={`resolution-item resolution-${opt.text.toLowerCase()}`}>
                            <span className="caption">{opt.text}</span>
                            <span className="time">{opt.time}</span>
                        </div>
                    )
                });
            });

            return {
                label: (
                    <div>
                        <span className="caption resolution">{this.state.defaults.resolution.text}</span>
                        <span>{lang.scan.quality}</span>
                    </div>
                ),
                content: (
                    <List items={options} onClick={this._onPickupResolution}/>
                )
            };
        },

        _getCalibrate: function(lang) {
            return {
                label: (
                    <div>
                        <button className="btn btn-default btn-calibrate caption" data-ga-event="calibrate" onClick={this.props.onCalibrate}>
                            {lang.scan.calibrate}
                        </button>
                    </div>
                )
            };
        },

        render: function() {
            var props = this.props,
                lang = props.lang,
                resolutionOptions = this._getResolutionOptions(lang),
                calibrate = this._getCalibrate(lang),
                cx = React.addons.classSet,
                className = props.className,
                items = [resolutionOptions, calibrate];

            className['setup-panel'] = true;

            return (
                <div className={cx(className)}>
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }

    });
});

define([
    'jquery',
    'react',
    'helpers/shortcuts',
    'app/constants/alert-constants',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function($, React, shortcuts, AlertConstants, Modal, Alert) {
    'use strict';

    var lang,
        acceptableTypes = [
            AlertConstants.INFO,
            AlertConstants.WARNING,
            AlertConstants.ERROR,
            AlertConstants.YES_NO,
            AlertConstants.RETRY_CANCEL,
            AlertConstants.RETRY_ABORT_CANCEL
        ],
        View = React.createClass({

            propTypes: {
                open        : React.PropTypes.bool,
                lang        : React.PropTypes.object,
                type        : React.PropTypes.oneOf(acceptableTypes),
                escapable   : React.PropTypes.bool,
                message     : React.PropTypes.string,
                onRetry     : React.PropTypes.func,
                onAbort     : React.PropTypes.func,
                onYes       : React.PropTypes.func,
                onClose     : React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    type      : AlertConstants.INFO,
                    escapable : false,
                    open      : true,
                    onRetry   : function() {},
                    onAbort   : function() {},
                    onYes     : function() {},
                    onClose   : function() {}
                };
            },

            componentWillMount: function() {
                lang = this.props.lang.alert;
            },

            componentDidMount: function() {
                var self = this;

                shortcuts.on(['esc'], function(e) {
                    self.props.onClose(e);
                });
            },

            componentWillUnmount: function() {
                shortcuts.off(['esc']);
            },

            // button actions
            _onClose: function(e, reactid, from) {
                this.props.onClose.apply(null, [e, reactid, from]);
            },

            _onYes: function(e, reactid) {
                this.props.onYes(e);
                this._onClose.apply(null, [e, reactid, 'yes']);
            },

            _onRetry: function(e, reactid) {
                this.props.onRetry(e);
                this._onClose.apply(null, [e, reactid, 'retry']);
            },

            _onAbort: function(e, reactid) {
                this.props.onAbort(e);
                this._onClose.apply(null, [e, reactid, 'abort']);
            },

            _getTypeTitle: function() {
                var types = {};
                types[AlertConstants.INFO]               = lang.info;
                types[AlertConstants.WARNING]            = lang.warning;
                types[AlertConstants.ERROR]              = lang.error;
                types[AlertConstants.RETRY_CANCEL]       = lang.error;
                types[AlertConstants.RETRY_ABORT_CANCEL] = lang.error;

                return types[this.props.type] || '';
            },

            _getCloseButtonCaption: function() {
                var caption = lang.cancel;

                switch (this.props.type) {
                case AlertConstants.YES_NO:
                    caption = lang.no;
                    break;
                case AlertConstants.INFO:
                case AlertConstants.WARNING:
                case AlertConstants.ERROR:
                    caption = lang.ok;
                    break;
                }

                return caption;
            },

            _getButtons: function() {
                var buttons = [];

                buttons.push({
                    label: this._getCloseButtonCaption(),
                    onClick: this.props.onClose
                });

                switch (this.props.type) {
                case AlertConstants.YES_NO:
                    buttons.push({
                        label: lang.yes,
                        onClick: this._onYes
                    });
                    break;
                case AlertConstants.RETRY_CANCEL:
                    buttons.push({
                        label: lang.retry,
                        onClick: this._onRetry
                    });
                    break;
                case AlertConstants.RETRY_ABORT_CANCEL:
                    buttons.push({
                        label: lang.abort,
                        onClick: this._onAbort
                    });
                    buttons.push({
                        label: lang.retry,
                        onClick: this._onRetry
                    });
                    break;
                }

                return buttons;
            },

            render: function() {
                if(!this.props.open) {
                    return (<div/>);
                }

                var typeTitle = this._getTypeTitle(),
                    buttons = this._getButtons(),
                    content = (
                        <Alert
                            lang={lang}
                            caption={typeTitle}
                            message={this.props.message}
                            buttons={buttons}
                        />
                    );

                return (
                    <Modal content={content} disabledEscapeOnBackground={this.props.escapable}/>
                );
            }

        });

    return View;
});

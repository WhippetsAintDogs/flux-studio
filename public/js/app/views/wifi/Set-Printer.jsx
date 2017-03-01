define([
    'jquery',
    'react',
    'helpers/i18n'
], function($, React, i18n) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onSetPrinter: React.PropTypes.func
            };
        },

        getInitialState: function() {
            return {
                validPrinterName    : true,
                validPrinterPassword: true
            };
        },

        _handleSetPrinter: function() {
            var name     = this.refs.name.getDOMNode().value,
                password = this.refs.password.getDOMNode().value;

            this.setState({
                validPrinterName: (name !== ''),
                validPrinterPassword: (password !== '')
            });

            if(name !== '') {
                this.props.onSetPrinter(name, password);
            }
        },

        render : function() {
            var lang = this.props.lang,
                cx = React.addons.classSet,
                printerNameClass;

            printerNameClass = cx({
                'required'  : true,
                'error'     : !this.state.validPrinterName
            });

            return (
                <div className="wifi center">
                    <div>
                        <h2>{lang.wifi.set_printer.caption}</h2>
                        <div className="wifi-form row-fluid clearfix">
                            <div className="col span5 flux-printer">
                                <img src="/img/img-flux-printer.png"/>
                            </div>
                            <div className="col span7 text-left">
                                <p>
                                    <label for="printer-name">
                                        {lang.wifi.set_printer.printer_name}
                                    </label>
                                    <input ref="name" id="printer-name" type="text" className={printerNameClass}
                                    placeholder={lang.wifi.set_printer.printer_name_placeholder}/>
                                </p>
                                <p>
                                    <label for="printer-password">
                                        {lang.wifi.set_printer.password}
                                    </label>
                                    <input ref="password" type="password"
                                    placeholder={lang.wifi.set_printer.password_placeholder}/>
                                </p>
                                <p className="notice">
                                    {lang.wifi.set_printer.notice}
                                </p>
                            </div>
                        </div>
                        <div>
                            <a id="btn-set-printer" className="btn btn-large" onClick={this._handleSetPrinter}>
                                {lang.wifi.set_printer.next}</a>
                        </div>
                    </div>
                </div>
            );
        }

    });
});

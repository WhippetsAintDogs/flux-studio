define([
    'react',
    'reactPropTypes',
    'app/constants/global-constants',
    'app/constants/device-constants',
    'app/constants/monitor-status',
    'helpers/duration-formatter'
], (
    React,
    PropTypes,
    GlobalConstants,
    DeviceConstants,
    MonitorStatus,
    FormatDuration
) => {

    'use strict';

    const findObjectContainsProperty = (infoArray = [], propertyName) => {
        return infoArray.filter((o) => Object.keys(o).some(n => n === propertyName));
    };

    return React.createClass({
        contextTypes: {
            store: PropTypes.object,
            slicingResult: PropTypes.object,
            lang: PropTypes.object
        },

        componentWillMount: function() {
            const { store, lang } = this.context;
            MonitorStatus['setLang'](lang);

            this.lang = lang;
            this.unsubscribe = store.subscribe(() => {
                this.forceUpdate();
            });
        },

        componentWillUnmount: function() {
            clearInterval(this.timer);
            this.unsubscribe();
        },

        _isAbortedOrCompleted: function() {
            let { Device } = this.context.store.getState();
            return (
                Device.status.st_id === DeviceConstants.status.ABORTED ||
                Device.status.st_id === DeviceConstants.status.COMPLETED
            );
        },

        _getHeadInfo: function() {
            let { Device } = this.context.store.getState();
            return Device.status.module ? this.lang.monitor.device[Device.status.module] : '';
        },

        _getStatus: function() {
            let { Monitor, Device } = this.context.store.getState();

            if(Boolean(Monitor.uploadProgress)) {
                return this.lang.device.uploading;
            }
            if(
                Device.status.st_label &&
                Device.status.st_label !== 'LOAD_FILAMENT' &&
                Device.status.st_label !== 'UNLOAD_FILAMENT'
            ) {
                let { displayStatus } = MonitorStatus[Device.status.st_label]();
                return displayStatus;
            }
            else {
                return '';
            }
        },

        _getTemperature: function() {
            let { Device } = this.context.store.getState();
            if(!Device.status || this._isAbortedOrCompleted()) {
                return '';
            }

            // rt = real temperature, tt = target temperature
            let { st_label, rt, tt } = Device.status,
                lang = this.lang.monitor;

            if(st_label === DeviceConstants.RUNNING) {
                return rt ? `${lang.temperature} ${parseInt(rt * 10) / 10} °C` : '';
            }
            else {
                return rt ? `${lang.temperature} ${parseInt(rt * 10) / 10} °C / ${tt} °C` : '';
            }
        },

        _getProgress: function() {
            this.context.slicingResult = this.context.slicingResult || {};
            let { Monitor, Device } = this.context.store.getState(),
                { time } = this.context.slicingResult,
                lang = this.lang.monitor;

            if(Object.keys(Device.status).length === 0) {
                return lang.connecting;
            }

            if(Number.isInteger(Monitor.uploadProgress)) {
                return `${lang.processing} ${Monitor.uploadProgress}%`;
            }

            if(Monitor.downloadProgress.size !== '') {
                return `${lang.processing} ${parseInt((Monitor.downloadProgress.size - Monitor.downloadProgress.left) / Monitor.downloadProgress.size * 100)}%`;
            }

            let o = findObjectContainsProperty(Device.jobInfo, 'TIME_COST');
            if(o.length !== 0) {
                time = o[0].TIME_COST;
            }

            if(
                !Device.status ||
                !Device.jobInfo ||
                typeof time === 'undefined' ||
                Monitor.mode === GlobalConstants.FILE_PREVIEW ||
                this._isAbortedOrCompleted() ||
                Device.status.st_label === 'WAITING_HEAD' ||
                !Device.status.prog
            ) {
                return '';
            }

            let percentageDone = parseInt(Device.status.prog * 100),
            // timeLeft = FormatDuration(o[0].TIME_COST * (1 - Device.status.prog));
            timeLeft = FormatDuration(time * (1 - Device.status.prog));

            return `${percentageDone}%, ${timeLeft} ${this.lang.monitor.left}`;
        },

        render: function() {
            return (
                <div className="wrapper">
                    <div className="row">
                        <div className="head-info">
                            {this._getHeadInfo()}
                        </div>
                        <div className="status right">
                            {this._getStatus()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="temperature">{this._getTemperature()}</div>
                        <div className="time-left right">{this._getProgress()}</div>
                    </div>
                </div>
            );
        }
    });

    return monitorInfo;
});

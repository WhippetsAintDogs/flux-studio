define([
    'jquery',
    'react',
    'jsx!widgets/Popup',
    'app/actions/scaned-model',
    'helpers/api/3d-scan-control',
    'helpers/api/3d-scan-modeling',
    'jsx!views/scan/Setup-Panel',
    'jsx!views/scan/Manipulation-Panel',
    'helpers/file-system'
], function($, React, popup, scanedModel, scanControl, scanModeling, SetupPanel, ManipulationPanel, fileSystem) {
    'use strict';

    return function(args) {
        args = args || {};

        var View = React.createClass({

                // ui events
                _rescan: function(e) {
                    this.setState({
                        scan_times : 0,
                        getting_started: false
                    });
                },

                _saveAs: function(e) {
                    var self = this;

                    require(['jsx!views/scan/Export'], function(view) {
                        var popup_window;

                        args.onExport = function(e) {
                            var last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                                file_format = $('[name="file-format"]:checked').val(),
                                file_name = (new Date()).getTime() + '.' + file_format;

                            self.props.scan_modeling_websocket.export(
                                last_point_cloud.name,
                                file_format,
                                {
                                    onFinished: function(blob) {
                                        var file = new File(
                                            [blob],
                                            file_name
                                        );

                                        fileSystem.writeFile(
                                            file,
                                            {
                                                onComplete: function(e, fileEntry) {
                                                    window.open(fileEntry.toURL());
                                                }
                                            }
                                        );

                                        popup_window.close();
                                    }
                                }
                            );
                        };
                        args.disabledEscapeOnBackground = false;

                        popup_window = popup(view, args);
                        popup_window.open();
                    });
                },

                _refreshCamera: function() {
                    var self = this;

                    self.setProps.call(self, {
                        scan_modeling_image_method: self.props.scan_ctrl_websocket.getImage(
                            function(image_blobs, mime_type) {
                                var blob = new Blob(image_blobs, {type: mime_type}),
                                    url = (window.URL || window.webkitURL),
                                    objectUrl = url.createObjectURL(blob),
                                    img = self.refs.camera_image.getDOMNode();

                                img.onload = function() {
                                    // release the object URL once the image has loaded
                                    url.revokeObjectURL(objectUrl);
                                    blob = null;
                                };

                                // trigger the image to load
                                img.src = objectUrl;
                            }
                        )
                    });
                },

                _startScan: function(e) {
                    var self = this;

                    require(['jsx!views/Print-Selector'], function(view) {
                        var popup_window;

                        popup_window = popup(
                            view,
                            {
                                getPrinter: function(auth_printer) {
                                    self.state.selected_printer = auth_printer;
                                    popup_window.close();
                                    self.setState({
                                        getting_started: true
                                    });
                                }
                            }
                        );

                        popup_window.open();
                    });
                },

                _getScanSpeed: function() {
                    return parseInt($('[name="scan_speed"] option:selected').val(), 10);
                },

                _onRendering: function(views, chunk_length) {
                    var self = this,
                        scan_speed = self._getScanSpeed(),
                        remaining_sec = ((scan_speed - chunk_length) * (20 * 60 / scan_speed)) || 0,
                        remaining_min = Math.floor(remaining_sec / 60) || 0,
                        progressPercentage;

                    remaining_sec = remaining_sec % (remaining_min * 60);

                    progressPercentage = Math.min(
                        (chunk_length / scan_speed * 100).toString().substr(0, 5),
                        100
                    );

                    args.state.is_finished = (100 <= progressPercentage);

                    args.state.progressPercentage = progressPercentage;

                    // update remaining time every 20 chunks
                    if (0 === chunk_length % 20) {
                        args.state.progressRemainingTime = remaining_min + 'm' + (remaining_sec || 0) + 's';
                    }

                    if ('undefined' === typeof self.props.mesh) {
                        self.setProps({
                            mesh: scanedModel.appendModel(views)
                        });
                    }
                    else {
                        self.setProps({
                            mesh: scanedModel.updateMesh(self.props.mesh, views)
                        });
                    }

                    window.mesh = self.props.mesh;
                },

                _handleScan: function(e, refs) {
                    var self = this,
                        popup_window,

                        onScanFinished = function(point_cloud) {
                            var upload_name = 'scan-' + (new Date()).getTime(),
                                onUploadFinished = function() {
                                    popup_window.close();

                                    // update scan times
                                    self.setState({
                                        scan_times: self.state.scan_times + 1
                                    });
                                };

                            // TODO: show operation panel
                            self.props.scan_modeling_websocket.upload(
                                upload_name,
                                point_cloud,
                                {
                                    onFinished: onUploadFinished
                                }
                            );

                        },
                        openProgressBar = function(callback) {
                            require(['jsx!views/scan/Progress-Bar'], function(view) {
                                self.props.scan_modeling_image_method.stop();

                                args.disabledEscapeOnBackground = true;
                                args.state.progressPercentage = 0;
                                args.state.progressRemainingTime = '20m0s';

                                popup_window = popup(view, args);
                                popup_window.open();

                                callback();

                            });
                        },
                        onScan = function() {
                            var opts = {
                                    onRendering: self._onRendering,
                                    onFinished: onScanFinished
                                },
                                scan_speed = self._getScanSpeed();

                            self.props.scan_ctrl_websocket.scan(scan_speed, opts);
                        };

                    self.refs = $.extend(true, {}, self.refs, refs);

                    scanedModel.init();

                    self.setState({
                        is_scan_started: true
                    });

                    openProgressBar(onScan);
                },

                _renderHeader: function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = args.state.lang,
                        header_class;

                    header_class = cx({
                        'top-menu-bar' : true,
                        'btn-h-group'  : true,
                        'invisible'    : 1 > state.scan_times
                    });

                    return (
                        <header ref="header" className={header_class}>
                            <button className="btn btn-default fa fa-undo" onClick={this._rescan}>{lang.scan.rescan}</button>
                            <button className="btn btn-default fa fa-paper-plane" onClick={this._saveAs}>{lang.scan.export}</button>
                            <button className="btn btn-default fa fa-floppy-o">{lang.scan.share}</button>
                            <button className="btn btn-default fa fa-eye">{lang.scan.print_with_flux}</button>
                        </header>
                    );
                },

                _renderBeginingSection: function() {
                    return (
                        <section className="starting-section">
                            <img className="launch-img absolute-center" src="http://placehold.it/280x193" onClick={this._startScan}/>
                        </section>
                    );
                },

                _doClearNoise: function() {
                    var self = this,
                        last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                        delete_noise_name = 'clear-noise-' + (new Date()).getTime(),
                        onDumpFinished = function(data) {
                            console.log('dump finished');
                            self._onRendering(data);
                        },
                        onDumpReceiving = function(data, len) {
                            console.log('dump receiving');
                            self._onRendering(data, len);
                        };

                    self.props.scan_modeling_websocket.delete_noise(
                        last_point_cloud.name,
                        delete_noise_name,
                        0.3,
                        {
                            onFinished: onDumpFinished,
                            onReceiving: onDumpReceiving
                        }
                    );
                },

                _doCropOn: function() {
                    console.log('crop on');
                    this.setProps({
                        cylinder: scanedModel.cylinder.create(this.props.mesh)
                    });
                },

                _doCropOff: function() {
                    var self = this,
                        last_point_cloud = self.props.scan_modeling_websocket.History.getLatest(),
                        cut_name = 'cut-' + (new Date()).getTime(),
                        cylider_box = new THREE.Box3().setFromObject(self.props.cylinder),
                        opts = {
                            onReceiving: self._onRendering
                        },
                        args = [
                            // min z
                            { mode: 'z', direction: 'True', value: cylider_box.min.z },
                            // max z
                            { mode: 'z', direction: 'False', value: cylider_box.max.z },
                            // radius
                            { mode: 'r', direction: 'False', value: Math.min(cylider_box.max.y, cylider_box.max.x) }
                        ];

                    if (window.confirm('Do crop?')) {

                        self.props.scan_modeling_websocket.cut(
                            last_point_cloud.name,
                            cut_name,
                            args,
                            opts
                        );

                    }

                    scanedModel.cylinder.remove(self.props.cylinder);
                    self.setProps({
                        cylinder: undefined
                    });
                },

                _renderSettingPanel: function() {
                    var start_scan_text,
                        lang = args.state.lang;

                    // TODO: setting up remaining time
                    lang.scan.remaining_time = '26min';

                    lang.scan.start_scan_text = (
                        0 < this.state.scan_times
                        ? lang.scan.start_multiscan
                        : lang.scan.start_scan
                    );

                    return (
                        <SetupPanel
                            lang={lang}
                            onScanClick={this._handleScan}>
                        </SetupPanel>
                    );
                },

                _renderManipulationPanel: function() {
                    var state = this.state,
                        lang = args.state.lang,
                        cx = React.addons.classSet,
                        display = 1 > state.scan_times;

                    return (
                        <ManipulationPanel
                            lang = {lang}
                            display={display}
                            onCropOn = {this._doCropOn}
                            onCropOff = {this._doCropOff}
                            onClearNoise = {this._doClearNoise}>
                        </ManipulationPanel>
                    );
                },

                _renderStageSection: function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        camera_image_class,
                        settingPanel = this._renderSettingPanel(),
                        manipulationPanel = this._renderManipulationPanel(),
                        lang = state.lang;

                    camera_image_class = cx({
                        'camera-image' : true,
                        'hide' : true === state.is_scan_started
                    });

                    return (
                        <section className="operating-section">

                            {settingPanel}
                            {manipulationPanel}

                            <div id="model-displayer" className="model-displayer">
                                <img ref="camera_image" src={this.state.image_src} className={camera_image_class}/>
                            </div>
                        </section>
                    );
                },

                getDefaultProps: function() {
                    return {
                        mesh: undefined,
                        cylinder: undefined,
                        scan_ctrl_websocket : undefined,
                        scan_modeling_websocket : undefined,
                        scan_modeling_image_method : undefined,
                    };
                },

                getInitialState: function() {
                    return {
                        image_src: '',
                        getting_started: false,
                        scan_times: 0,
                        selected_printer: undefined
                    };
                },

                componentWillUnmount: function() {
                    if ('undefined' !== typeof this.props.scan_ctrl_websocket &&
                        'undefined' !== typeof this.props.scan_modeling_websocket
                    ) {
                        this.props.scan_ctrl_websocket.connection.close(false);
                        this.props.scan_modeling_websocket.connection.close(false);
                    }
                },

                render : function() {
                    var state = this.state,
                        cx = React.addons.classSet,
                        lang = state.lang,
                        activeSection,
                        header;

                    header = this._renderHeader();

                    activeSection = (
                        false === state.getting_started ?
                        this._renderBeginingSection() :
                        this._renderStageSection()
                    );

                    return (
                        <div className="studio-container scan-studio">

                            {header}

                            <div className="stage">

                                {activeSection}

                            </div>
                        </div>
                    );
                },
                componentDidMount: function() {
                    var self = this,
                        state, timer;

                    timer = setInterval(function() {
                        state = self.state;

                        // console.log(state.getting_started, state.selected_printer);
                        if (true === state.getting_started && null !== state.selected_printer) {
                            self.setProps({
                                scan_ctrl_websocket: scanControl(state.selected_printer.serial),
                                scan_modeling_websocket: scanModeling()
                            });
                            self._refreshCamera();
                            clearInterval(timer);
                        }
                    }, 100);
                }

            });

        return View;
    };
});
/**
 * nwjs events
 */
define(['jquery', 'helpers/i18n'], function($, i18n) {
    'use strict';

    var win = nw.Window.get(),
        lang = i18n.get();

    window.FLUX.killAPI = function() {
        var spawn = requireNode('child_process').spawn,
            $deferred = $.Deferred(),
            killCommmand,
            args,
            options = {
                detached: true
            },
            pkill;

        switch (window.FLUX.osType) {
        case 'osx':
        case 'linux':
            killCommmand = 'pkill';
            args = ['-f', 'flux_api'];
            break;
        case 'win':
            killCommmand = 'taskkill';
            args = ['/F', '/FI', '"IMAGENAME eq flux_api.exe*"'];
            break;
        }

        pkill = spawn(killCommmand, args, options);

        return $deferred.resolve().promise();
    };

    if (true === window.FLUX.isNW) {
        win.title = 'FLUX Studio - ' + window.FLUX.version;

        win.on('close', function() {
            var isQuit = window ? window.confirm(lang.topmenu.sure_to_quit) : true;

            if (true === isQuit) {
                
                fs.readdirSync('tmp').forEach(function(file,index){
                    fs.unlinkSync('tmp/' + file);
                });

                window.FLUX.killAPI().always(function() {
                    nw.App.quit();
                });
            }
        });
    }
});

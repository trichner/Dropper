/* 
 * Dropper v1.0.1j - 2017-02-03 
 * A jQuery plugin for simple drag and drop uploads. Part of the Formstone Library. 
 * http://classic.formstone.it/dropper/ 
 * 
 * Copyright 2017 Ben Plum; MIT Licensed 
 */

/*
 * Dropper v1.0.1b - 2015-06-23
 * A jQuery plugin for simple drag and drop uploads. Part of the Formstone Library.
 * http://classic.formstone.it/dropper/
 *
 * Copyright 2015 Ben Plum; MIT Licensed
 */

;(function ($, window) {
    "use strict";

    var supported = (window.File && window.FileReader && window.FileList);

    /**
     * @options
     * @param action [string] "Where to submit uploads"
     * @param label [string] <'Drag and drop files or click to select'> "Dropzone text"
     * @param maxQueue [int] <2> "Number of files to simultaneously upload"
     * @param maxSize [int] <5242880> "Max file size allowed"
     * @param postData [object] "Extra data to post with upload"
     * @param postKey [string] <'file'> "Key to upload file as"
     */

    var options = {
        action: "",
        label: "Drag and drop files or click to select",
        maxQueue: 2,
        maxSize: 0, // 0 = no limit, otherwise use something like 5242880 (5 mb)
        postData: {},
        postKey: "file",
        validExtensions: [] // no extensions means all are valid
    };

    /**
     * @events
     * @event start.dropper ""
     * @event complete.dropper ""
     * @event fileStart.dropper ""
     * @event fileProgress.dropper ""
     * @event fileComplete.dropper ""
     * @event fileError.dropper ""
     */

    var pub = {

        /**
         * @method
         * @name defaults
         * @description Sets default plugin options
         * @param opts [object] <{}> "Options object"
         * @example $.dropper("defaults", opts);
         */
        defaults: function(opts) {
            options = $.extend(options, opts || {});

            return (typeof this === 'object') ? $(this) : true;
        }
    };

    /**
     * @method private
     * @name _init
     * @description Initializes plugin
     * @param opts [object] "Initialization options"
     */
    function _init(opts) {
        var $items = $(this);

        if (supported) {
            // Settings
            opts = $.extend({}, options, opts);

            // Apply to each element
            for (var i = 0, count = $items.length; i < count; i++) {
                _build($items.eq(i), opts);
            }
        }

        return $items;
    }

    /**
     * @method private
     * @name _build
     * @description Builds each instance
     * @param $nav [jQuery object] "Target jQuery object"
     * @param opts [object] <{}> "Options object"
     */
    function _build($dropper, opts) {
        opts = $.extend({}, opts, $dropper.data("dropper-options"));

        var html = "";

        html += '<div class="dropper-dropzone">';
        html += opts.label;
        html += '</div>';
        html += '<input class="dropper-input" type="file"';
        if (opts.maxQueue > 1) {
            html += ' multiple';
        }
        html += '>';

        $dropper.addClass("dropper")
                .append(html);

        var data =  $.extend({
            $dropper: $dropper,
            $input: $dropper.find(".dropper-input"),
            queue: [],
            total: 0,
            uploading: false
        }, opts);

        $dropper.on("click.dropper", ".dropper-dropzone", data, _onClick)
                .on("dragenter.dropper", data, _onDragEnter)
                .on("dragover.dropper", data, _onDragOver)
                .on("dragleave.dropper", data, _onDragOut)
                .on("drop.dropper", ".dropper-dropzone", data, _onDrop)
                .data("dropper", data);

        data.$input.on("change.dropper", data, _onChange);
    }

    /**
     * @method private
     * @name _onClick
     * @description Handles click to dropzone
     * @param e [object] "Event data"
     */
    function _onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$input.trigger("click");
    }

    /**
     * @method private
     * @name _onChange
     * @description Handles change to hidden input
     * @param e [object] "Event data"
     */
    function _onChange(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data,
            files = data.$input[0].files;

        if (files.length) {
            _handleUpload(data, files);
        }
    }

    /**
     * @method private
     * @name _onDragEnter
     * @description Handles dragenter to dropzone
     * @param e [object] "Event data"
     */
    function _onDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOver
     * @description Handles dragover to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOut
     * @description Handles dragout to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOut(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.removeClass("dropping");
    }

    /**
     * @method private
     * @name _onDrop
     * @description Handles drop to dropzone
     * @param e [object] "Event data"
     */
    function _onDrop(e, file) {

        e.preventDefault();

        var data = e.data,
            // files allows us to make this method testable
            files = file ? [file] : e.originalEvent.dataTransfer.files;

        data.$dropper.removeClass("dropping");

        _handleUpload(data, files);
    }

    /**
     * @method private
     * @name _handleUpload
     * @description Handles new files
     * @param data [object] "Instance data"
     * @param files [object] "File list"
     */
    function _handleUpload(data, files) {
        var newFiles = [];

        for (var i = 0; i < files.length; i++) {
            var file = {
                index: data.total++,
                file: files[i],
                name: files[i].name,
                size: files[i].size,
                started: false,
                complete: false,
                error: false,
                transfer: null
            };

            newFiles.push(file);
            data.queue.push(file);
       }

       if (!data.uploading) {
           $(window).on("beforeunload.dropper", function(){
                return 'You have uploads pending, are you sure you want to leave this page?';
            });

            data.uploading = true;
        }

        data.$dropper.trigger("start.dropper", [ newFiles ]);

        // data.action may be either a string or a promise.
        // Wrapping it in another promise means that both will work.
        if (data.action.then) {
            // We have a promise
            window.Promise.resolve(data.action)
                .then(
                    function(action) {
                        data.action = action;
                        _checkQueue(data);
                    },
                    function(err) {
                        throw err;
                    }
                );

        } else {
            // We have a string
            _checkQueue(data);
        }

    }

    // wraps string into utf8 blob
    function _utf8Blob(str) {
        return new Blob([str], {type: "text/plain; charset=utf-8"});
    }

    /**
     * @method private
     * @name _checkQueue
     * @description Checks and updates file queue
     * @param data [object] "Instance data"
     */
    function _checkQueue(data) {
        var transfering = 0,
            newQueue = [];

        // remove lingering items from queue
        for (var i in data.queue) {
            if (data.queue.hasOwnProperty(i) && !data.queue[i].complete && !data.queue[i].error) {
                newQueue.push(data.queue[i]);
            }
        }

        data.queue = newQueue;

        for (var j in data.queue) {
            if (data.queue.hasOwnProperty(j)) {
                if (!data.queue[j].started) {
                    var formData = new FormData();

                    var file = data.queue[j].file;
                    formData.append(data.postKey, file);
                    formData.append("filename", _utf8Blob(file.name));

                    for (var k in data.postData) {
                        if (data.postData.hasOwnProperty(k)) {
                            formData.append(k, data.postData[k]);
                        }
                    }

                    _uploadFile(data, data.queue[j], formData);
                }

                transfering++;

                if (transfering >= data.maxQueue) {
                    return;
                } else {
                    i++;
                }
            }
        }

        if (transfering === 0) {
            $(window).off("beforeunload.dropper");

            data.uploading = false;

            data.$dropper.trigger("complete.dropper");
        }
    }

    /**
     * @method private
     * @name _uploadFile
     * @description Uploads file
     * @param data [object] "Instance data"
     * @param file [object] "Target file"
     * @param formData [object] "Target form"
     */
    function _uploadFile(data, file, formData) {
        if (data.validExtensions.length) {
            var ext = file.name.split('.')[file.name.split('.').length - 1];
            var re = new RegExp(ext);
            var filtered = data.validExtensions.filter(function(item){
                return re.test(item);
            });

            // Does our file extension exist in the array of allowable extensions?
            if (!filtered.length) {
                file.error = true;
                data.$dropper.trigger("fileError.dropper", [ file, "Invalid extension" ]);

                _checkQueue(data);
            }
        }

        if (data.maxSize && file.size >= data.maxSize) {
            file.error = true;
            data.$dropper.trigger("fileError.dropper", [ file, "Too large" ]);

            _checkQueue(data);
        }

        if (!file.error) {
            file.started = true;
            file.transfer = $.ajax({
                url: data.action,
                data: data.httpMethod === 'PUT' ? file.file : formData,
                type: data.httpMethod || 'POST',
                contentType:false,
                processData: false,
                cache: false,
                xhr: function() {
                    var $xhr = $.ajaxSettings.xhr();

                    if ($xhr.upload) {
                        $xhr.upload.addEventListener("progress", function(e) {
                            var percent = 0,
                                position = e.loaded || e.position,
                                total = e.total;

                            if (e.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }

                            data.$dropper.trigger("fileProgress.dropper", [ file, percent ]);
                        }, false);
                    }

                    return $xhr;
                },
                beforeSend: function(e) {
                    data.$dropper.trigger("fileStart.dropper", [ file ]);
                },
                success: function(response, status, jqXHR) {
                    file.complete = true;
                    data.$dropper.trigger("fileComplete.dropper", [ file, response ]);

                    _checkQueue(data);
                },
                error: function(jqXHR, status, error) {
                    file.error = true;
                    data.$dropper.trigger("fileError.dropper", [ file, error ]);

                    _checkQueue(data);
                }
            });
        }
    }

    $.fn.dropper = function(method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    $.dropper = function(method) {
        if (method === "defaults") {
            pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
})(jQuery, window);

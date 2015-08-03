<h2>Development of this plugin has ended. Please upgrade to the new <a href="http://formstone.it">Formstone</a>.</h2><br>

<a href="http://gruntjs.com" target="_blank"><img src="https://cdn.gruntjs.com/builtwith.png" alt="Built with Grunt"></a>
# Dropper

A jQuery plugin for simple drag and drop uploads. Part of the Formstone Library.

- [Demo](http://classic.formstone.it/components/Dropper/demo/index.html)
- [Documentation](http://classic.formstone.it/dropper/)



---

## Fairfax fork

Extra features added include:

* the ability to specifiy a list of valid file extensions
* the ability to have no maxSize limit
* the ability to be able to test _onDrop by passing it a files object
* the ability to pass in either a URL string or a promise

The action URL can be supplied as a string, or a promise &#8212; this is useful
when we need to generate a URL after the drag and drop is initiated, for example
in the case of getting a signed S3 URL which depends on the filename.
In this case, it is presumed that the promise-resolving code will be listening
for the `start.dropper` to know when an upload has been requested.

A Jasmine test of this module could look something like the following:

    # in SpecRunner.html
    <script type="text/javascript" src="lib/jasmine-1.3/jasmine.js"></script>
    <script type="text/javascript" src="lib/jasmine-1.3/jasmine-html.js"></script>
    <script type="text/javascript" src="lib/jasmine-1.3/boot.js"></script>

    <script type="text/javascript" src="../../main/ui/bower_components/jquery-legacy/dist/jquery.min.js"></script>

    <script type="text/javascript" src="lib/jasmine-jquery/lib/jasmine-jquery.js"></script>

    <!-- include source files here... -->
    <script type="text/javascript" src="../../main/ui/bower_components/dropper/jquery.fs.dropper.js"></script>

    <!-- Include specification files to run the test -->
    <script type="text/javascript" src="spec/dropper-spec.js"></script>

    # In spec/dropper-spec.js
    describe("Dropper", function() {
        "use strict";

        var _mockDragAndDrop = (function () {/*
            <div class="dropper-demo" id="dropperDemo">
                <form action=":javascript;">

                    <div class="dropper__container">

                        <div class="dropped"></div>

                        <!-- Progress bar -->
                        <div class="ui-progress u-square-cornered">
                            <span class="ui-progress__bar"></span>
                        </div>
                        <!-- / Progress bar -->

                        <!-- Alerts -->
                        <div class="ui-alert u-square-cornered" style="display:none;">
                            <div class="ui-alert__title"></div>
                            <a href=":javascript;" class="ui-alert__close"></a>
                        </div>
                        <!-- / Alerts -->

                    </div>

                </form>
            </div>
        */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

        var $container,
            eventListener,
            fakeFile = {};

        beforeEach(function(){

            setFixtures(_mockDragAndDrop);

            $container = $('.dropper-demo');

            $container.find('.dropped').dropper({
                action: "http://whatever.com",
                maxSize: 2000000000, // brightcove has a 2GB limit
                validExtensions: ['.3g2', '.3gp', '.asf', '.avi', '.dv', '.flv', '.mov', '.mp4', '.mpeg', '.mpg', '.qt', '.wmv'] // refer http://support.brightcove.com/en/knowledge-base/what-video-file-formats-can-i-upload-using-media-module
            }).on("fileError.dropper", onFileError);

            function onFileError(e, file, error) {
                $('.dropper-demo .ui-alert')
                    .addClass('ui-alert--error');

                $container.find('.ui-alert .ui-alert__title').text('File upload failed: ' + error);
            }
        });

        it('should complain if we have a file that meets the size limit of 2GB', function(){
            var file = {
                name: "test.mp4",
                size: 2000000000,
                type: "video/mp4",
                complete: false,
                started: false
            };

            var spyEvent = spyOnEvent('.dropper-dropzone', 'drop.dropper');
            $container.find(".dropper-dropzone").trigger('drop.dropper', file)

            expect('drop.dropper').toHaveBeenTriggeredOn('.dropper-dropzone');
            expect($container.find('.ui-alert .ui-alert__title').text()).toMatch(/Too large/);

        });

        it('should complain if we use an invalid file extension', function(){
            var file = {
                name: "test.ogv",
                size: 5242880,
                type: "video/ogv",
                complete: false,
                started: false
            };

            var spyEvent = spyOnEvent('.dropper-dropzone', 'drop.dropper');
            $container.find(".dropper-dropzone").trigger('drop.dropper', file)

            expect('drop.dropper').toHaveBeenTriggeredOn('.dropper-dropzone');
            expect($container.find('.ui-alert .ui-alert__title').text()).toMatch(/Invalid extension/);
        });

    });

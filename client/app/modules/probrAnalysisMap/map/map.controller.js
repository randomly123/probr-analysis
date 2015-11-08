'use strict'

angular.module('probrAnalysisMap')
    .controller('MapCtrl', function ($scope, $state, $stateParams, $rootScope, Location, Room) {

        // MultiRange Slider
        $scope.rangeArray = [
            {value: 0.5, name: 'Start'},
            {value: 0.8, name: 'End'},
        ]

        // DatePicker
        $scope.datePickerDate = {startDate: new Date().getTime(), endDate: new Date().getTime() - (1000 * 60 * 60 * 24)};

        // Room
        Room.query({}, function (rooms) {
            $scope.rooms = rooms;
        });

        $scope.overlays = {};

        $scope.query = function () {

            var areaCutoff = 10;

            // Range Slider gives us a fraction of 24 hours. This section generates an approriate timestamp for it.
            var startHour = Math.floor($scope.rangeArray[0].value * 24);
            var endHour = Math.floor($scope.rangeArray[1].value * 24);

            var startMinute = Math.floor(60 * ($scope.rangeArray[0].value * 24 - Math.floor($scope.rangeArray[0].value * 24)));
            var endMinute = Math.floor(60 * ($scope.rangeArray[1].value * 24 - Math.floor($scope.rangeArray[1].value * 24)));

            var startTime = new Date($scope.datePickerDate.startDate);
            startTime.setHours(startHour);
            startTime.setMinutes(startMinute);

            var endTime = new Date($scope.datePickerDate.endDate);
            endTime.setHours(endHour);
            endTime.setMinutes(endMinute);

            Location.query({
                query: {
                    area: {$lte: areaCutoff},
                    noOfCircles: {$gte: 4},
                    time: {$gt: startTime, $lt: endTime}
                }
            }, function (resultObj) {

                $scope.nrOfLocations = resultObj.length;

                var data = [];
                var areaSum = 0;

                angular.forEach(resultObj, function (obj) {
                    //var intensity = Math.log(areaCutoff / obj.area) / 150;
                    areaSum = areaSum + obj.area;
                    data.push([obj.location.coordinates[1], obj.location.coordinates[0], 0.3]);
                });

                var overlays = {
                    heatmap: {
                        name: "Heat Map",
                        type: "webGLHeatmap",
                        data: data,
                        visible: true,
                        layerOptions: {size: 1},
                        doRefresh: true
                    }
                }

                angular.extend($scope.overlays, overlays);

            });
        };

    });

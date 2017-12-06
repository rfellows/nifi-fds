/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the 'License'); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var NfRegistryRoutes = require('nifi-registry/nf-registry.routes.js');
var ngCoreTesting = require('@angular/core/testing');
var ngCommonHttpTesting = require('@angular/common/http/testing');
var ngCommon = require('@angular/common');
var FdsDemo = require('nifi-registry/components/fluid-design-system/fds-demo.js');
var NfRegistry = require('nifi-registry/nf-registry.js');
var NfRegistryApi = require('nifi-registry/services/nf-registry.api.js');
var NfRegistryService = require('nifi-registry/services/nf-registry.service.js');
var NfPageNotFoundComponent = require('nifi-registry/components/page-not-found/nf-registry-page-not-found.js');
var NfRegistryExplorer = require('nifi-registry/components/explorer/nf-registry-explorer.js');
var NfRegistryAdministration = require('nifi-registry/components/administration/nf-registry-administration.js');
var NfRegistryUsersAdministration = require('nifi-registry/components/administration/users/nf-registry-users-administration.js');
var NfRegistryAddUser = require('nifi-registry/components/administration/users/dialogs/add-user/nf-registry-add-user.js');
var NfRegistryUserDetails = require('nifi-registry/components/administration/users/details/nf-registry-user-details.js');
var NfRegistryUserPermissions = require('nifi-registry/components/administration/users/permissions/nf-registry-user-permissions.js');
var NfRegistryUserGroupPermissions = require('nifi-registry/components/administration/user-group/permissions/nf-registry-user-group-permissions.js');
var NfRegistryBucketPermissions = require('nifi-registry/components/administration/workflow/buckets/permissions/nf-registry-bucket-permissions.js');
var NfRegistryWorkflowAdministration = require('nifi-registry/components/administration/workflow/nf-registry-workflow-administration.js');
var NfRegistryGridListViewer = require('nifi-registry/components/explorer/grid-list/registry/nf-registry-grid-list-viewer.js');
var NfRegistryBucketGridListViewer = require('nifi-registry/components/explorer/grid-list/registry/nf-registry-bucket-grid-list-viewer.js');
var NfRegistryDropletGridListViewer = require('nifi-registry/components/explorer/grid-list/registry/nf-registry-droplet-grid-list-viewer.js');
var fdsCore = require('@fluid-design-system/core');
var ngMoment = require('angular2-moment');
var ngHttp = require('@angular/http');
var rxjs = require('rxjs/Rx');
var ngCommonHttp = require('@angular/common/http');
var NfRegistryTokenInterceptor = require('nifi-registry/services/nf-registry.token.interceptor.js');
var NfRegistryAuthService = require('nifi-registry/services/nf-registry.auth.service.js');
var NfStorage = require('nifi-registry/services/nf-storage.service.js');

describe('NfRegistry Service API w/ Angular testing utils', function () {
    var comp;
    var fixture;
    var nfRegistryApi;
    var nfRegistryService;

    beforeEach(function () {
        ngCoreTesting.TestBed.configureTestingModule({
            imports: [
                ngMoment.MomentModule,
                ngHttp.HttpModule,
                ngHttp.JsonpModule,
                ngCommonHttp.HttpClientModule,
                fdsCore,
                NfRegistryRoutes,
                ngCommonHttpTesting.HttpClientTestingModule
            ],
            declarations: [
                FdsDemo,
                NfRegistry,
                NfRegistryExplorer,
                NfRegistryAdministration,
                NfRegistryUsersAdministration,
                NfRegistryUserDetails,
                NfRegistryUserPermissions,
                NfRegistryUserGroupPermissions,
                NfRegistryBucketPermissions,
                NfRegistryAddUser,
                NfRegistryWorkflowAdministration,
                NfRegistryGridListViewer,
                NfRegistryBucketGridListViewer,
                NfRegistryDropletGridListViewer,
                NfPageNotFoundComponent
            ],
            providers: [
                NfRegistryService,
                NfRegistryAuthService,
                NfRegistryApi,
                NfStorage,
                {
                    provide: ngCommonHttp.HTTP_INTERCEPTORS,
                    useClass: NfRegistryTokenInterceptor,
                    multi: true
                },
                {
                    provide: ngCommon.APP_BASE_HREF,
                    useValue: '/'
                }
            ],
            bootstrap: [NfRegistry]
        });
        fixture = ngCoreTesting.TestBed.createComponent(NfRegistry);
        fixture.detectChanges();
        comp = fixture.componentInstance;

        // NfRegistryService from the root injector
        nfRegistryService = ngCoreTesting.TestBed.get(NfRegistryService);
        nfRegistryApi = ngCoreTesting.TestBed.get(NfRegistryApi);
        spyOn(nfRegistryApi, 'ticketExchange').and.callFake(function () {
        }).and.returnValue(rxjs.Observable.of({}));
        spyOn(nfRegistryService, 'loadCurrentUser').and.callFake(function () {
        }).and.returnValue(rxjs.Observable.of({}));
    });

    it('should GET droplet snapshot metadata.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getDropletSnapshotMetadata('flow/test').subscribe(function (response) {
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/flow/test/versions');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            snapshotMetadata: [
                {identifier: '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc', version: 999}
            ]
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET droplet snapshot metadata.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getDropletSnapshotMetadata('flow/test').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/flow/test/versions: 401 GET droplet mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/flow/test/versions: 401 GET droplet mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/flow/test/versions');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET droplet mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET droplet by type and ID.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getDroplet('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc', 'flows', '2e04b4fb-9513-47bb-aa74-1ae34616bfdc').subscribe(function (response) {
            expect(response.identifier).toEqual('2e04b4fb-9513-47bb-aa74-1ae34616bfdc');
            expect(response.type).toEqual('FLOW');
            expect(response.name).toEqual('Flow #1');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc/flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': '2e04b4fb-9513-47bb-aa74-1ae34616bfdc',
            'name': 'Flow #1',
            'description': 'This is flow #1',
            'bucketIdentifier': '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'createdTimestamp': 1505931890999,
            'modifiedTimestamp': 1505931890999,
            'type': 'FLOW',
            'snapshotMetadata': null,
            'link': {
                'params': {
                    'rel': 'self'
                },
                'href': 'flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc'
            }
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET droplet by type and ID.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
            return {
                afterClosed: function() { return rxjs.Observable.of(true); }
            }
        });

        // api call
        nfRegistryApi.getDroplet('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc', 'flows', '2e04b4fb-9513-47bb-aa74-1ae34616bfdc').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc/flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc: 401 GET droplet mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc/flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc: 401 GET droplet mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc/flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET droplet mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET all droplets across all buckets.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getDroplets().subscribe(function (response) {
            expect(response.length).toBe(2);
            expect(response[0].bucketIdentifier).toEqual('9q7f9e54-dc09-4ceb-aa58-9fe581319cdc');
            expect(response[1].bucketIdentifier).toEqual('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
            expect(response[0].name).toEqual('Flow #1');
            expect(response[1].name).toEqual('Flow #2');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/items');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush([{
            'identifier': '2e04b4fb-9513-47bb-aa74-1ae34616bfdc',
            'name': 'Flow #1',
            'description': 'This is flow #1',
            'bucketIdentifier': '9q7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'createdTimestamp': 1505931890999,
            'modifiedTimestamp': 1505931890999,
            'type': 'FLOW',
            'snapshotMetadata': null,
            'link': {
                'params': {
                    'rel': 'self'
                },
                'href': 'flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc'
            }
        }, {
            'identifier': '5d04b4fb-9513-47bb-aa74-1ae34616bfdc',
            'name': 'Flow #2',
            'description': 'This is flow #2',
            'bucketIdentifier': '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'createdTimestamp': 1505931890999,
            'modifiedTimestamp': 1505931890999,
            'type': 'FLOW',
            'snapshotMetadata': null,
            'link': {
                'params': {
                    'rel': 'self'
                },
                'href': 'flows/5d04b4fb-9513-47bb-aa74-1ae34616bfdc'
            }
        }]);

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET all droplets across all buckets.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getDroplets().subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/items: 401 GET droplet mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/items: 401 GET droplet mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/items');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET droplet mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET all droplets across a single bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getDroplets('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc').subscribe(function (response) {
            expect(response.length).toBe(1);
            expect(response[0].bucketIdentifier).toEqual('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
            expect(response[0].name).toEqual('Flow #1');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/items/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush([{
            'identifier': '2e04b4fb-9513-47bb-aa74-1ae34616bfdc',
            'name': 'Flow #1',
            'description': 'This is flow #1',
            'bucketIdentifier': '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'createdTimestamp': 1505931890999,
            'modifiedTimestamp': 1505931890999,
            'type': 'FLOW',
            'snapshotMetadata': null,
            'link': {
                'params': {
                    'rel': 'self'
                },
                'href': 'flows/2e04b4fb-9513-47bb-aa74-1ae34616bfdc'
            }
        }]);

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET all droplets across a single bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getDroplets('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/items/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc: 401 GET droplet mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/items/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc: 401 GET droplet mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/items/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET droplet mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should DELETE a droplet.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.deleteDroplet('flows/1234').subscribe(function (response) {
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/flows/1234');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush({});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to DELETE a droplet.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.deleteDroplet('flows/1234').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/flows/1234: 401 DELETE droplet mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/flows/1234: 401 DELETE droplet mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/flows/1234');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'DELETE droplet mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should POST to create a new bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.createBucket('test').subscribe(function (response) {
            expect(response.identifier).toBe('1234');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            identifier: '1234'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to POST to create a new bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.createBucket('test').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/buckets: 401 POST bucket mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/buckets: 401 POST bucket mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'POST bucket mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should DELETE a bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.deleteBucket('1234').subscribe(function (response) {
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/1234');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush({});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to DELETE a bucket.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.deleteBucket('1234').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/buckets/1234: 401 DELETE bucket mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/buckets/1234: 401 DELETE bucket mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/1234');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'DELETE bucket mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET bucket by ID.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
            return {
                afterClosed: function() { return rxjs.Observable.of(true); }
            }
        });

        // api call
        nfRegistryApi.getBucket('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc').subscribe(function (response) {
            expect(response.identifier).toEqual('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
            expect(response.name).toEqual('Bucket #1');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'name': 'Bucket #1'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET bucket by ID.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
            return {
                afterClosed: function() { return rxjs.Observable.of(true); }
            }
        });

        // api call
        nfRegistryApi.getBucket('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc: 401 GET bucket mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc: 401 GET bucket mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets/2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET bucket mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET metadata for all buckets in the registry for which the client is authorized.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getBuckets().subscribe(function (response) {
            expect(response[0].identifier).toEqual('2f7f9e54-dc09-4ceb-aa58-9fe581319cdc');
            expect(response[0].name).toEqual('Bucket #1');
        });
        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush([{
            'identifier': '2f7f9e54-dc09-4ceb-aa58-9fe581319cdc',
            'name': 'Bucket #1'
        }]);

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET metadata for all buckets in the registry for which the client is authorized.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getBuckets().subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/buckets: 401 GET metadata mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/buckets: 401 GET metadata mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/buckets');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET metadata mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should POST to add a new user.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.addUser('test').subscribe(function (response) {
            expect(response.identifier).toBe('1234');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            identifier: '1234'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to POST to add a new user.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.addUser('test').subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/users: 401 POST add user mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/users: 401 POST add user mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'POST add user mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET users.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getUsers().subscribe(function (response) {
            expect(response[0].identity).toEqual('User #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush([{
            'identifier': 123,
            'identity': 'User #1'
        }]);

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail GET users.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getUsers().subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/users: 401 GET users mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/users: 401 GET users mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET users mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should DELETE users.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.deleteUser(123).subscribe(function (response) {
            expect(response.identity).toEqual('User #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users/123');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'User #1'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to DELETE users.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.deleteUser(123).subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/users/123: 401 DELETE users mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/users/123: 401 DELETE users mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/users/123');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'DELETE users mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET user groups.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getUserGroups().subscribe(function (response) {
            expect(response[0].identity).toEqual('Group #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush([{
            'identifier': 123,
            'identity': 'Group #1'
        }]);

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET user groups.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getUserGroups().subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/user-groups: 401 GET user groups mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/user-groups: 401 GET user groups mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET user groups mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.getUserGroup(123).subscribe(function (response) {
            expect(response.identity).toEqual('Group #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'Group #1'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.getUserGroup(123).subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/user-groups/123: 401 GET user groups mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/user-groups/123: 401 GET user groups mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET user groups mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should DELETE a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.deleteUserGroup(123).subscribe(function (response) {
            expect(response.identity).toEqual('Group #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'Group #1'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to DELETE a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.deleteUserGroup(123).subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/user-groups/123: 401 DELETE user groups mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/user-groups/123: 401 DELETE user groups mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('DELETE');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'DELETE user groups mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should POST to create a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.createNewGroup(123, 'Group #1', [{identity: 'User #1', identifier: 9999}]).subscribe(function (response) {
            expect(response.identifier).toEqual(123);
            expect(response.identity).toEqual('Group #1');
            expect(response.users[0].identity).toEqual('User #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'Group #1',
            'users': [{identity: 'User #1', identifier: 9999}]
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to POST to create a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.createNewGroup(123, 'Group #1', [{identity: 'User #1', identifier: 9999}]).subscribe(function (response) {
            expect(response.message).toEqual('Http failure response for /nifi-registry-api/tenants/user-groups: 401 POST user groups mock error');
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/user-groups: 401 POST user groups mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'POST user groups mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should PUT to update a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.updateUserGroup(123, 'Group #1', [{identity: 'User #1', identifier: 9999}]).subscribe(function (response) {
            expect(response.identifier).toEqual(123);
            expect(response.identity).toEqual('Group #1');
            expect(response.users[0].identity).toEqual('User #1');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('PUT');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'Group #1',
            'users': [{identity: 'User #1', identifier: 9999}]
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to PUT to update a user group.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.dialogService, 'openConfirm').and.callFake(function () {
        });

        // api call
        nfRegistryApi.updateUserGroup('123', 'Group #1', [{identity: 'User #1', identifier: '9999'}]).subscribe(function (response) {
            var dialogServiceCall = nfRegistryApi.dialogService.openConfirm.calls.first();
            expect(dialogServiceCall.args[0].title).toBe('Error');
            expect(dialogServiceCall.args[0].message).toBe('Http failure response for /nifi-registry-api/tenants/user-groups/123: 401 PUT user groups mock error');
            expect(dialogServiceCall.args[0].acceptButton).toBe('Ok');
            expect(dialogServiceCall.args[0].acceptButtonColor).toBe('fds-warn');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/tenants/user-groups/123');
        expect(req.request.method).toEqual('PUT');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'PUT user groups mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));
});

describe('NfRegistry Service API w/ Angular testing utils', function () {
    var comp;
    var fixture;
    var nfRegistryApi;
    var nfRegistryService;

    beforeEach(function () {
        ngCoreTesting.TestBed.configureTestingModule({
            imports: [
                ngMoment.MomentModule,
                ngHttp.HttpModule,
                ngHttp.JsonpModule,
                ngCommonHttp.HttpClientModule,
                fdsCore,
                NfRegistryRoutes,
                ngCommonHttpTesting.HttpClientTestingModule
            ],
            declarations: [
                FdsDemo,
                NfRegistry,
                NfRegistryExplorer,
                NfRegistryAdministration,
                NfRegistryUsersAdministration,
                NfRegistryUserDetails,
                NfRegistryUserPermissions,
                NfRegistryUserGroupPermissions,
                NfRegistryBucketPermissions,
                NfRegistryAddUser,
                NfRegistryWorkflowAdministration,
                NfRegistryGridListViewer,
                NfRegistryBucketGridListViewer,
                NfRegistryDropletGridListViewer,
                NfPageNotFoundComponent
            ],
            providers: [
                NfRegistryService,
                NfRegistryAuthService,
                NfRegistryApi,
                NfStorage,
                {
                    provide: ngCommonHttp.HTTP_INTERCEPTORS,
                    useClass: NfRegistryTokenInterceptor,
                    multi: true
                },
                {
                    provide: ngCommon.APP_BASE_HREF,
                    useValue: '/'
                }
            ],
            bootstrap: [NfRegistry]
        });
        fixture = ngCoreTesting.TestBed.createComponent(NfRegistry);
        fixture.detectChanges();
        comp = fixture.componentInstance;

        // NfRegistryService from the root injector
        nfRegistryService = ngCoreTesting.TestBed.get(NfRegistryService);
        nfRegistryApi = ngCoreTesting.TestBed.get(NfRegistryApi);
    });

    it('should POST to exchange tickets.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.nfStorage, 'setItem').and.callThrough();

        // api call
        nfRegistryApi.ticketExchange().subscribe(function (response) {
            var setItemCall = nfRegistryApi.nfStorage.setItem.calls.first();
            expect(setItemCall.args[1]).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiYmVuZGVATklGSS5BUEFDSEUuT1JHIiwiaXNzIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwiYXVkIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYmJlbmRlQE5JRkkuQVBBQ0hFLk9SRyIsImtpZCI6IjQ3NWQwZWEyLTkzZGItNDhiNi05MjcxLTgyOGM3MzQ5ZTFkNiIsImlhdCI6MTUxMjQ4NTY4NywiZXhwIjoxNTEyNTI4ODg3fQ.lkaWPQw1ld7Qqb6-Zu8mAqu6r8mUVHBNP0ZfNpES3rA');
            expect(response).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiYmVuZGVATklGSS5BUEFDSEUuT1JHIiwiaXNzIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwiYXVkIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYmJlbmRlQE5JRkkuQVBBQ0hFLk9SRyIsImtpZCI6IjQ3NWQwZWEyLTkzZGItNDhiNi05MjcxLTgyOGM3MzQ5ZTFkNiIsImlhdCI6MTUxMjQ4NTY4NywiZXhwIjoxNTEyNTI4ODg3fQ.lkaWPQw1ld7Qqb6-Zu8mAqu6r8mUVHBNP0ZfNpES3rA');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/access/token/kerberos');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiYmVuZGVATklGSS5BUEFDSEUuT1JHIiwiaXNzIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwiYXVkIjoiS2VyYmVyb3NTcG5lZ29JZGVudGl0eVByb3ZpZGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYmJlbmRlQE5JRkkuQVBBQ0hFLk9SRyIsImtpZCI6IjQ3NWQwZWEyLTkzZGItNDhiNi05MjcxLTgyOGM3MzQ5ZTFkNiIsImlhdCI6MTUxMjQ4NTY4NywiZXhwIjoxNTEyNTI4ODg3fQ.lkaWPQw1ld7Qqb6-Zu8mAqu6r8mUVHBNP0ZfNpES3rA');

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should load jwt from local storage.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.nfStorage, 'hasItem').and.callFake(function () {
            return true;
        });
        spyOn(nfRegistryApi.nfStorage, 'getItem').and.callFake(function () {
            return 123;
        });

        // api call
        nfRegistryApi.ticketExchange().subscribe(function (response) {
            expect(response).toBe(123);
        });
    }));

    it('should fail to POST to exchange tickets.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.nfStorage, 'hasItem').and.callFake(function () {
            return false;
        });
        // api call
        nfRegistryApi.ticketExchange().subscribe(function (response) {
            expect(response).toEqual('');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/access/token/kerberos');
        expect(req.request.method).toEqual('POST');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'POST exchange tickets mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should GET to load the current user.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // api call
        nfRegistryApi.loadCurrentUser().subscribe(function (response) {
            expect(response.identifier).toBe(123);
            expect(response.identity).toBe('Admin User');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/access');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush({
            'identifier': 123,
            'identity': 'Admin User'
        });

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));

    it('should fail to GET to load the current user.', ngCoreTesting.inject([ngCommonHttpTesting.HttpTestingController], function (httpMock) {
        // Spy
        spyOn(nfRegistryApi.router, 'navigateByUrl').and.callFake(function () {});

        // api call
        nfRegistryApi.loadCurrentUser().subscribe(function (response) {
            var navigateByUrlCall = nfRegistryApi.router.navigateByUrl.calls.first();
            expect(navigateByUrlCall.args[0]).toBe('/nifi-registry/login');
        });

        // the request it made
        req = httpMock.expectOne('/nifi-registry-api/access');
        expect(req.request.method).toEqual('GET');

        // Next, fulfill the request by transmitting a response.
        req.flush(null, {status: 401, statusText: 'GET current user mock error'});

        // Finally, assert that there are no outstanding requests.
        httpMock.verify();
    }));
});
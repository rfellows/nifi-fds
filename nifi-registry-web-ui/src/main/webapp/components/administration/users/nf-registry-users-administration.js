/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ngCore = require('@angular/core');
var rxjs = require('rxjs/Rx');
var NfRegistryService = require('nifi-registry/services/nf-registry.service.js');
var NfRegistryApi = require('nifi-registry/services/nf-registry.api.js');
var NfStorage = require('nifi-registry/services/nf-storage.service.js');
var ngRouter = require('@angular/router');
var nfRegistryAnimations = require('nifi-registry/nf-registry.animations.js');
var ngMaterial = require('@angular/material');
var fdsDialogsModule = require('@fluid-design-system/dialogs');
var NfRegistryAddUser = require('nifi-registry/components/administration/users/dialogs/add-user/nf-registry-add-user.js');
var NfRegistryCreateNewGroup = require('nifi-registry/components/administration/users/dialogs/create-new-group/nf-registry-create-new-group.js');
var NfRegistryAddSelectedUsersToGroup = require('nifi-registry/components/administration/users/dialogs/add-selected-users-to-group/nf-registry-add-selected-users-to-group.js');

/**
 * NfRegistryUsersAdministration constructor.
 *
 * @param nfRegistryApi         The api service.
 * @param nfStorage             A wrapper for the browser's local storage.
 * @param nfRegistryService     The nf-registry.service module.
 * @param activatedRoute        The angular activated route module.
 * @param fdsDialogService      The FDS dialog service.
 * @param matDialog             The angular material dialog module.
 * @constructor
 */
function NfRegistryUsersAdministration(nfRegistryApi, nfStorage, nfRegistryService, activatedRoute, fdsDialogService, matDialog) {
    this.route = activatedRoute;
    this.nfStorage = nfStorage;
    this.nfRegistryService = nfRegistryService;
    this.nfRegistryApi = nfRegistryApi;
    this.dialogService = fdsDialogService;
    this.dialog = matDialog;
    this.usersActions = [{
        name: 'permissions',
        icon: 'fa fa-pencil',
        tooltip: 'Manage User Policies',
        type: 'sidenav'
    }, {
        name: 'Delete',
        icon: 'fa fa-trash',
        tooltip: 'Delete User'
    }];
    this.userGroupsActions = [{
        name: 'permissions',
        icon: 'fa fa-pencil',
        tooltip: 'Manage User Group Policies',
        type: 'sidenav'
    }, {
        name: 'Delete',
        icon: 'fa fa-trash',
        tooltip: 'Delete User Group'
    }];
};

NfRegistryUsersAdministration.prototype = {
    constructor: NfRegistryUsersAdministration,

    /**
     * Initialize the component.
     */
    ngOnInit: function () {
        var self = this;
        // attempt kerberos authentication
        this.nfRegistryApi.ticketExchange().subscribe(function (jwt) {
            self.nfRegistryService.loadCurrentUser().subscribe(function (currentUser) {
                self.route.params
                    .switchMap(function (params) {
                        self.nfRegistryService.adminPerspective = 'users';
                        return new rxjs.Observable.forkJoin(
                            self.nfRegistryApi.getUsers(),
                            self.nfRegistryApi.getUserGroups()
                        );
                    })
                    .subscribe(function (response) {
                        var users = response[0];
                        var groups = response[1];
                        self.nfRegistryService.users = users;
                        self.nfRegistryService.groups = groups;
                        self.nfRegistryService.filterUsersAndGroups();
                    });
            });
        });
    },

    /**
     * Destroy the component.
     */
    ngOnDestroy: function () {
        this.nfRegistryService.adminPerspective = '';
        this.nfRegistryService.users = this.nfRegistryService.filteredUsers = [];
        this.nfRegistryService.groups = this.nfRegistryService.filteredUserGroups = [];
        this.nfRegistryService.allUsersAndGroupsSelected = false;
    },

    /**
     * Opens the create new bucket dialog.
     */
    addUser: function () {
        this.dialog.open(NfRegistryAddUser);
    },

    /**
     * Opens the create new group dialog.
     */
    createNewGroup: function () {
        this.dialog.open(NfRegistryCreateNewGroup);
    },

    /**
     * Opens the add selected users to groups dialog.
     */
    addSelectedUsersToGroup: function () {
        if (this.nfRegistryService.getSelectedGroups().length === 0) {
            // ok...only users are currently selected...go ahead and open the dialog to select groups
            this.dialog.open(NfRegistryAddSelectedUsersToGroup);
        } else {
            self.dialogService.openConfirm({
                title: 'Error: Groups may not be added to a group. Please deselect any groups and try again',
                message: error.message,
                acceptButton: 'Ok',
                acceptButtonColor: 'fds-warn'
            });
        }
    }
};

NfRegistryUsersAdministration.annotations = [
    new ngCore.Component({
        template: require('./nf-registry-users-administration.html!text'),
        animations: [nfRegistryAnimations.slideInLeftAnimation],
        host: {
            '[@routeAnimation]': 'routeAnimation'
        }
    })
];

NfRegistryUsersAdministration.parameters = [
    NfRegistryApi,
    NfStorage,
    NfRegistryService,
    ngRouter.ActivatedRoute,
    fdsDialogsModule.FdsDialogService,
    ngMaterial.MatDialog
];

module.exports = NfRegistryUsersAdministration;

/**
 * Copyright (C) 2005-2014 Rivet Logic Corporation.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');
	
	A.Rivet.TreeTargetJournal = 'journal';
	A.Rivet.TreeTargetDL = 'documentLibrary';

	var ENTRIES_CONTAINER = 'entriesContainer';
	var BOUNDING_BOX = 'boundingBox';
	var TREE_NODE = 'tree-node';
	var NODE_SELECTOR = '.'+TREE_NODE;
	var NODE_CHECKBOX_SELECTOR = '.tree-node-checkbox-container';
	var PARENT_NODE = 'parentNode';
	var NODE = 'node';
	var NODE_ATTR_ID = 'id';
	var NODE_ATTR_ENTRY_ID = 'entryId';
	var NODE_ATTR_IS_FOLDER = 'isFolder';
	var NODE_ATTR_PARENT_FOLDER = 'parentFolderId';
	var NODE_ATTR_FULL_LOADED = 'fullLoaded';
	var NODE_ATTR_PREVIEW_IMG_PREF = 'pvTreeImage';
	var NODE_ATTR_PREVIEW_IMG_NODE = 'previewNode';
	var NODE_ATTR_PREVIEW_URL = 'previewURL';
	var NODE_ATTR_SHORTCUT = 'shortcut';
	var NODE_TYPE_CHECKBOX = 'check';
	var TPT_DELIM_OPEN = '{{';
	var TPT_DELIM_CLOSE = '}}';
	var TPT_ENCODED_DELIM_OPEN = '&#x7b;&#x7b;';
	var TPT_ENCODED_DELIM_CLOSE = '&#x7d;&#x7d;';
	var TPL_PREVIEW_NODE = '<img src="{previewFileURL}" id="{imgId}" class="treePreviewImg"/>';
	var TPL_SHORTCUT_PREVIEW_NODE = '<img src="{shortcutImageURL}" class="shortcut-icon img-polaroid" alt="Shortcut">';
	var WORKFLOW_STATUS_ANY = -1;
	var QUERY_ALL = -1;
	var REG_EXP_GLOBAL = 'g';
	var SHORTCUT_LABEL = 'shortcut-tree-node-label';
	var END_GET_CHILDREN_EVENT = 'treeview:reset';
	 
    A.Rivet.ContentTreeView = A.Base.create('rl-content-tree-view',A.Base, [], {

    	ns : null,
    	treeTarget : null,
    	repository: null,
    	scopeGroup: null,
    	contentTree: null,
    	contentRoot : null,
    	compiledItemSelectorTemplate: null,
    	hiddenFieldsBox: null,
    	previewBoundingBox: null,
    	defaultArticleImage: null,
    	viewPageBaseURL: null,
    	shortcutNode: null,

        initializer: function () {
        
        	this.ns = this.get('namespace');        	        	
        	this.scopeGroupId = this.get('scopeGroupId');
        	this._getTargetAttributes();        	
        	this.viewPageBaseURL = this.get('viewPageBaseURL');   
        	this.defaultArticleImage = this.get('defaultArticleImage');
        	
        	var folderId = this.get('rootFolderId');
        	var folderLabel = this.get('rootFolderLabel');
        	var checkAllEntriesId = this.get('checkAllId');
        	var shortcutImageURL = this.get('shortcutImageURL');
        	
        	
        	var instance = this;
        	var boundingBoxId = this.ns + this.get('treeBox');
        	var hiddenBoundingBoxId = boundingBoxId + 'HiddenFields';
        	var previewBoundingBoxId = boundingBoxId + 'Preview';
        	
        	A.one('#'+this.ns+ENTRIES_CONTAINER).append('<div id="'+previewBoundingBoxId+'" class="rl-tree-preview"></div>');
        	A.one('#'+this.ns+ENTRIES_CONTAINER).append('<div id="'+boundingBoxId+'"></div>');
        	A.one('#'+this.ns+ENTRIES_CONTAINER).append('<div id="'+hiddenBoundingBoxId+'"></div>');
        	
        	this.hiddenFieldsBox =  A.one('#'+hiddenBoundingBoxId).hide();
        	this.previewBoundingBox = A.one('#'+previewBoundingBoxId);
        	
        	this.shortcutNode = A.Lang.sub(TPL_SHORTCUT_PREVIEW_NODE, {"shortcutImageURL":shortcutImageURL}); 
        	
        	this.contentTree = new A.TreeViewDD(
        		      {
        		        boundingBox: '#'+boundingBoxId,
        		        children: [
        		        	{
        		        		id: folderId,
        		        		label: folderLabel,
        		        		draggable: false,
        		        		alwaysShowHitArea: true,
        		        		leaf:false,
        		        		expanded: true
        		        	}
        		       	],
        		       	after: {
        		       		'drop:hit': A.bind(instance._afterDropHitHandler,this),
        		       	},
        		       	on: {
        		       		'drop:hit': A.bind(instance._dropHitHandler,this),
        		       		'drag:start': function(event){
        		       			console.log(event);
        		       			console.log("drag:start")
        		       		},
        		       		'drag:end': function(event){
        		       			console.log(event);
        		       			console.log("drag:end")
        		       		},
        		       		'treeview:reset': A.bind(instance._endLoadChildren,this)
        		       	}
        		      }
        		    ).render();
        	
        	this.contentRoot = this.contentTree.getNodeById(folderId);
        	this.contentRoot.set(NODE_ATTR_IS_FOLDER, true);
        	this.contentRoot.set(NODE_ATTR_FULL_LOADED, true);
        	
        	// Adding this event on this way because the click event seems on creation seems to be on tree level
        	var boundingBox = this.contentTree.get(BOUNDING_BOX);        	
        	boundingBox.delegate('click', A.bind(instance._clickHandler,this), NODE_SELECTOR); 
        	boundingBox.delegate('mouseover', A.bind(instance._mouseOverHandler,this), NODE_SELECTOR); 

        	// This is used to manage the selection from toolbar
        	A.one('#'+this.ns+checkAllEntriesId+'Checkbox').on('click',A.bind(instance._selectAllHiddenCheckbox,this));
        	
        	//template
        	var itemSelectorTemplate = A.one('#'+this.ns+'item-selector-template').get('innerHTML');
        	
        	// some template tokens get lost because encoding:
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_OPEN, REG_EXP_GLOBAL),TPT_DELIM_OPEN);
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_CLOSE, REG_EXP_GLOBAL),TPT_DELIM_CLOSE);
        	
            // compiles template
            this.compiledItemSelectorTemplate = A.Handlebars.compile(itemSelectorTemplate);
        },
        
        addContentFolder: function(newNodeConfig, parentNode){	
        	this._addContentNode(newNodeConfig, parentNode, true);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	newNodeConfig.expanded = false;
        	newNodeConfig.fullLoaded = true;
        	this._addContentNode(newNodeConfig, parentNode, false);
        },
        
        _getTargetAttributes: function(){
        	this.treeTarget = this.get('treeTarget');
        	if (this._isDLTarget()){
        		this.repository = this.get('repositoryId');
        	}
        },
        
        _isDLTarget: function(){        	
        	return (this.treeTarget === A.Rivet.TreeTargetDL);
        },
        
        _endLoadChildren: function (event){
        	console.log('on treeview:reset '); 
   			console.log(event);
   			this.contentTree.renderUI();
        },
        
        _dropHitHandler: function(event){        	
        	var dragNode = event.drag.get(NODE).get(PARENT_NODE);
            var dragTreeNode = dragNode.getData(TREE_NODE);
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);          
            if (!(dropTreeNode instanceof A.TreeNode)) {
                event.preventDefault();
            }
            else{
            	this._moveContentNode(dragTreeNode,dropTreeNode);
            }
        },
        
        _afterDropHitHandler: function(event){     	
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);
        	if (!(this._isFullLoaded(dropTreeNode))){
        		dropTreeNode.empty();
    			this._getChildren(dropTreeNode, this);
    		}
        },       
        
        _moveContentNode: function(node, target){
        	if (!this._isFolder(target)){
        		target = target.get(PARENT_NODE);
        	}
        	var parentNode = node.get(PARENT_NODE);
        	if (parentNode.get(NODE_ATTR_ID) != target.get(NODE_ATTR_ID)){
        		if (this._isDLTarget()){
        			this._moveDLContentNode(node, target);
        		}
        		else{
        			this._moveJournalContentNode(node, target);
        		}
        	}       	        	
        },
        
        _moveDLContentNode: function(node, target){
        	if (this._isFolder(node)){
        		this._moveDLFolder(node, target);
        	}
        	else{
        		var isShortcut = (node.get(NODE_ATTR_SHORTCUT));
        		if (!isShortcut){
        			this._moveDLFileEntry(node, target);
        		}
        		else{
        			this._moveDLFileShortcut(node, target);
        		}
        	}     	        	
        },
        
        _moveJournalContentNode: function(node, target){
        	if (this._isFolder(node)){
        		this._moveJournalFolder(node, target);
        	}
        	else{
    			this._moveJournalArticle(node, target);
        	}     	        	
        },
        
        _moveDLFolder: function(folder, target){
        	Liferay.Service(
    			'/dlapp/move-folder',
    			{
    				repositoryId: this.repository,
    				folderId: folder.get(NODE_ATTR_ID),
    				parentFolderId: target.get(NODE_ATTR_ID),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.repository
                        }
                    )
    			}
        	);
        },
        
        _moveDLFileEntry: function(entry, target){        	
        	Liferay.Service(
    			'/dlapp/move-file-entry',
    			{
    				repositoryId: this.repository,        				
    				fileEntryId: entry.get(NODE_ATTR_ID),
    				newFolderId: target.get(NODE_ATTR_ID),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.repository
                        }
                    )
    			}
        	);
        },
        
        _moveDLFileShortcut: function(entry, target){        	
        	 Liferay.Service(
           		 '/dlapp/update-file-shortcut',
           		 {
           		    fileShortcutId: entry.get(NODE_ATTR_ID),
           		    folderId: target.get(NODE_ATTR_ID),
           		    toFileEntryId: entry.get(NODE_ATTR_ENTRY_ID),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.repository
                        }
                    )
           		 }
       		);
        },
        
        _moveJournalFolder: function(folder, target){
        	Liferay.Service(
    			'/journalfolder/move-folder',
    			{
    				folderId: folder.get(NODE_ATTR_ID),
    				parentFolderId: target.get(NODE_ATTR_ID),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.scopeGroupId
                        }
                    )
    			}
        	);
        },
        
        _moveJournalArticle: function(entry, target){        	
        	Liferay.Service(
    			'/journalarticle/move-article',
    			{
    				groupId: this.scopeGroupId,        				
    				articleId: entry.get(NODE_ATTR_ID),
    				newFolderId: target.get(NODE_ATTR_ID)
    			}
        	);
        },
        
        _mouseOverHandler: function(event){
        	event.stopPropagation();
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.get(NODE_ATTR_ID));
        	this._showPreview(treeNode);
        },
        
        _goToFileEntryViewPage: function(event){
        	event.stopPropagation();
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.get(NODE_ATTR_ID));
			var viewURL = Liferay.PortletURL.createURL(this.viewPageBaseURL);
			if (this._isDLTarget()){
				viewURL.setParameter("fileEntryId", treeNode.get(NODE_ATTR_ENTRY_ID));
    		}
			else{
				viewURL.setParameter("articleId", treeNode.get(NODE_ATTR_ID));
				viewURL.setParameter("folderId", treeNode.get(NODE_ATTR_PARENT_FOLDER));
				viewURL.setParameter("groupId", this.scopeGroupId);
			}
			
			Liferay.Util.getOpener().location.href = viewURL.toString();
        },
        
        _showPreview: function(treeNode){       	
        	this.previewBoundingBox.empty();        	
        	if (treeNode!== undefined && !this._isFolder(treeNode)){
	        	var previewURL = treeNode.get(NODE_ATTR_PREVIEW_URL);
	        	var previewImgNode = treeNode.get(NODE_ATTR_PREVIEW_IMG_NODE);
	        	if (!previewImgNode && previewURL !== undefined){
	        		previewImgNode = this._createPreview(treeNode);
	        	}       	
	        	this.previewBoundingBox.append(previewImgNode);
	        	if ( treeNode.get(NODE_ATTR_SHORTCUT)){
	        		this.previewBoundingBox.append(this.shortcutNode);
	        	}
        	}
        },      
        
        _clickHandler: function(event){

        	event.stopPropagation();
    	
        	var isHitArea = event.target.hasClass('tree-hitarea');
        	var isCheckbox = event.target.hasClass('tree-node-checkbox-container');
        	var isItemName = event.target.hasClass('tree-label');
        	
        	if (isHitArea){
        		this._clickHitArea(event);
        	}
        	
        	//If click is over label it change the check status. 
        	// But it doesn't happen if it is the hit area.
        	if (isCheckbox){
        		this._clickCheckBox(event);        		
        	}
        	
        	if (isItemName){
        		var treeNode = this.contentTree.getNodeById(event.currentTarget.get(NODE_ATTR_ID));
        		if (!this._isFolder(treeNode)){
        			this._goToFileEntryViewPage(event);
        		}
        		else{
        			this._clickCheckBox(event);  
        		}
        	}
        	
        },
        
        _createPreview: function(treeNode){
        	var previewImgId = this.ns + NODE_ATTR_PREVIEW_IMG_PREF + treeNode.get(NODE_ATTR_ID);
        	var previewURL = treeNode.get(NODE_ATTR_PREVIEW_URL);      	    
        	var previewNode = A.Lang.sub(TPL_PREVIEW_NODE, {"imgId":previewImgId, "previewFileURL":previewURL}); 
        	       	
        	treeNode.set(NODE_ATTR_PREVIEW_IMG_NODE, previewNode);    	
        	return previewNode;
        },
        
        _clickCheckBox: function(event){
        	var selectedNodeId = event.currentTarget.attr(NODE_ATTR_ID);
        	var relatedCheckbox = this.hiddenFieldsBox.one('[type=checkbox][value='+selectedNodeId+']');        	
        	if (relatedCheckbox !== null){
        		relatedCheckbox.simulate("click");
        	}
        	 
        },
               
        _clickHitArea: function(event){
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.attr(NODE_ATTR_ID)); 
        	if (treeNode) {
        		if (!(this._isFullLoaded(treeNode))){
        			this._getChildren(treeNode, this);
        		}
            }
        },
        
        _selectAllHiddenCheckbox: function(event){
        	var checked = event.target.attr('checked');
        	this.contentTree.get(BOUNDING_BOX).all(NODE_CHECKBOX_SELECTOR).each(function(node){
        	var nodeChecked = node.one('[type=checkbox]').attr('checked');
        	if (nodeChecked !== checked){
        		  node.simulate('click');
        	  }
        	});
        },
                    
       _addContentNode: function(newNodeConfig, parentNode, isFolder){
    	   var nodeType = '';
    	   var label = newNodeConfig.label;
    	   var nodeId = newNodeConfig.id;
    	   
    	   if (parentNode === undefined && newNodeConfig.parentFolderId !== undefined){
    		   parentNode = this.contentTree.getNodeById(newNodeConfig.parentFolderId);
       	   }
    	   
    	   if (newNodeConfig.showCheckbox){
    		   nodeType = NODE_TYPE_CHECKBOX;
    	   }
    	   
    	   if (parentNode === undefined){
       			parentNode = this.contentRoot;
       		}
    	   
    	   var expanded = (newNodeConfig.expanded !== undefined)? newNodeConfig.expanded: false;
    		   
		   if (newNodeConfig.shortcut){
			   label = Liferay.Language.get(SHORTCUT_LABEL)+label;
			   nodeId = newNodeConfig.rowCheckerId;
		   }
		      	   
    	   var newNode = this.contentRoot.createNode(
			  {
			    id: nodeId,
			    label: label,
			    draggable: true,
        		alwaysShowHitArea: true,
			    leaf:!isFolder,
			    type: nodeType,
        		expanded: expanded
			  }
			);        	
    	   	newNode.set(NODE_ATTR_PARENT_FOLDER, newNodeConfig.parentFolderId);
        	newNode.set(NODE_ATTR_IS_FOLDER, isFolder);
        	newNode.set(NODE_ATTR_FULL_LOADED, newNodeConfig.fullLoaded);
        	newNode.set(NODE_ATTR_SHORTCUT, newNodeConfig.shortcut);
        	newNode.set(NODE_ATTR_ENTRY_ID, newNodeConfig.id);
        	
        	if (newNodeConfig.previewURL !== undefined){
        		newNode.set(NODE_ATTR_PREVIEW_URL, newNodeConfig.previewURL);
        	}         	
        	parentNode.appendChild(newNode);        	
    		this.contentTree.bindUI();        	
        	if (nodeType === NODE_TYPE_CHECKBOX){
        		// add checkbox
        		this._addProcessCheckbox(newNodeConfig);
        	}
        },
        
        _addProcessCheckbox: function(newNodeConfig){
    		this.hiddenFieldsBox.append(this.compiledItemSelectorTemplate(newNodeConfig));
        },
        
        _getChildren: function(treeNode, instance) {  
        	if (this._isDLTarget()){
        		this._getDLChildren(treeNode, instance);
        	}
        	else{
        		this._getWCChildren(treeNode, instance);
        	}
        },

        _getDLChildren: function(treeNode, instance) {        	   
        	// Get folders children of this folder
        	Liferay.Service(
           			'/content-tree-view-hook.enhanceddlapp/get-folders-and-file-entries-and-file-shortcuts',
           			{
           				repositoryId: instance.repository,
           				folderId: treeNode.get(NODE_ATTR_ID),
           				status: WORKFLOW_STATUS_ANY,
           				includeMountFolders :true,
        				start: QUERY_ALL,
        				end: QUERY_ALL
           			},
           			function(entries) {
           				A.each(entries, function(item, index, collection){
           					var enableCheckbox = (item.deletePermission || item.updatePermission);
           					//if it is a file entry
           					if (item.fileEntryId !== undefined){
            					instance.addContentEntry({
            						id : item.fileEntryId.toString(),
            						label: item.title,
            						shortcut: item.shortcut,
            						showCheckbox: enableCheckbox,
            						rowCheckerId: item.rowCheckerId,
        							rowCheckerName: item.rowCheckerName,
            						expanded: false,
               						fullLoaded: true,
               						previewURL: item.previewFileURL,
            					},treeNode);
           					}
           					//If it is a folder
           					else{
           						
	           					instance.addContentFolder({
	           						id : item.folderId.toString(),
	           						label: item.name,
	           						showCheckbox: enableCheckbox,
	           						rowCheckerId: item.rowCheckerId,
        							rowCheckerName: item.rowCheckerName,
	           						expanded: false,
	           						fullLoaded: false
	           					},treeNode);
           					}
           				});
           				
           				treeNode.set(NODE_ATTR_FULL_LOADED, true);
           	        	treeNode.expand();
           	        	
           	        	// Fix for floating tooltip
           	        	instance.contentTree.fire('treeview:reset');
           			}
           		); 
        },
        
        _getWCChildren: function(treeNode, instance) {        	   
        	// Get folders children of this folder
        	Liferay.Service(
           			'/content-tree-view-hook.enhancedjournalapp/get-folders-and-articles',
           			{
           				groupId: instance.scopeGroupId,
           				folderId: treeNode.get(NODE_ATTR_ID),
        				start: QUERY_ALL,
        				end: QUERY_ALL
           			},
           			function(entries) {
           				A.each(entries, function(item, index, collection){
           					var enableCheckbox = (item.deletePermission || item.updatePermission);
           					//if it is an article
           					if (item.articleId !== undefined){     
           						enableCheckbox = (enableCheckbox || item.expirePermission);
           						var articleImageURL = instance._getArticleImageURL(item);           						
            					instance.addContentEntry({
            						id : item.articleId.toString(),
            						label: item.title,
            						showCheckbox: enableCheckbox,
            						rowCheckerId: item.rowCheckerId,
        							rowCheckerName: item.rowCheckerName,
            						expanded: false,
               						fullLoaded: true,
               						previewURL: articleImageURL,
            					},treeNode);
           					}
           					//If it is a folder
           					else{
           						
	           					instance.addContentFolder({
	           						id : item.folderId.toString(),
	           						label: item.name,
	           						showCheckbox: enableCheckbox,
	           						rowCheckerId: item.rowCheckerId,
        							rowCheckerName: item.rowCheckerName,
	           						expanded: false,
	           						fullLoaded: false
	           					},treeNode);
           					}
           				});
           				
           				treeNode.set(NODE_ATTR_FULL_LOADED, true);
           	        	treeNode.expand();
           			}
           		);
        },
        
        _getArticleImageURL: function(item){
        	var articleImageURL = item.articleImageURL;
			if (articleImageURL === null ||articleImageURL === undefined){
				articleImageURL = this.defaultArticleImage;
			}
			else if (A.Lang.String.startsWith(articleImageURL, "/journal/article")){
				articleImageURL = themeDisplay.getPathImage()+articleImageURL;
			}
			return articleImageURL;
        },
        
        _isFolder: function(treeNode){
        	result = false;
        	if (treeNode){
        		result = treeNode.get(NODE_ATTR_IS_FOLDER);
        	}
        	return result;
        },
        
        _isFullLoaded: function(treeNode){
        	result = false;
        	if (treeNode){
        		result = treeNode.get(NODE_ATTR_FULL_LOADED);
        	}
        	return result;
        }
    
    }, {
        ATTRS: {

        	namespace:{
        		value: null
        	},
        	treeBox:{
        		value: null
        	},
        	treeTarget:{
        		value: null
        	},
        	repositoryId:{
        		value: null
        	},
        	scopeGroupId:{
        		value: null
        	},
            rootFolderId: {
                value: null
            },
            rootFolderLabel:{
            	value: null
            },
            checkAllId:{
            	value: null
            },
            viewPageBaseURL:{
            	value: null
            },
            shortcutImageURL:{
            	value: null
            },
            defaultArticleImage:{
            	value: null
            },
        }
    });
 
}, '1.0.0', {
    requires: ['aui-tree-view','json','liferay-portlet-url','handlebars', 'liferay-preview']
});
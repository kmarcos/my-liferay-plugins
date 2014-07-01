AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var TREE_NODE = 'tree-node';
	var NODE_SELECTOR = '.'+TREE_NODE;
	var PARENT_NODE = 'parentNode';
	var NODE = 'node';
	var NODE_ATTR_IS_FOLDER = 'isFolder';
	var NODE_ATTR_FULL_LOADED = 'fullLoaded';
	var NODE_ATTR_PREVIEW_IMG_PREF = 'pvTreeImage';
	var NODE_ATTR_PREVIEW_IMG_NODE = 'previewNode';
	var NODE_ATTR_PREVIEW_URL = 'previewURL';
	var NODE_ATTR_PREVIEW_FILE_COUNT = 'previewFileCount';
	var TPT_DELIM_OPEN = '{{';
	var TPT_DELIM_CLOSE = '}}';
	var TPT_ENCODED_DELIM_OPEN = '&#x7b;&#x7b;';
	var TPT_ENCODED_DELIM_CLOSE = '&#x7d;&#x7d;';
	var TPL_PREVIEW_NODE = '<img src="{previewFileURL}" id="{imgId}" class="treePreviewImg"/>';
	var WORKFLOW_STATUS_ANY = -1;
	 
    A.Rivet.ContentTreeView = A.Base.create('rl-content-tree-view',A.Base, [], {

    	ns : null,
    	repository: null,
    	scopeGroup: null,
    	contentTree: null,
    	contentRoot : null,
    	compiledItemSelectorTemplate: null,
    	hiddenFieldsBox: null,
    	previewBoundingBox: null,
    	fileEntryBaseURL: null,
    	fileEntryCheckerName: null,
		folderCheckerName: null,
		shortcutCheckerName: null,

        initializer: function () {
        
        	this.ns = this.get('namespace');
        	this.repository = this.get('repositoryId');
        	this.scopeGroup = this.get('scopeGroupId');
        	this.fileEntryBaseURL = this.get('fileEntryBaseURL');
        	this.fileEntryCheckerName = this.get('fileEntryCheckerName');
        	this.folderCheckerName = this.get('folderCheckerName');
        	this.shortcutCheckerName = this.get('shortcutCheckerName');
        	
        	var folderId = this.get('rootFolderId');
        	var folderLabel = this.get('rootFolderLabel');
        	var checkAllEntriesId = this.get('checkAllId');
        	
        	var instance = this;
        	var boundingBoxId = this.ns + this.get('treeBox');
        	var hiddenBoundingBoxId = boundingBoxId + 'HiddenFields';
        	var previewBoundingBoxId = boundingBoxId + 'Preview';
        	
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+previewBoundingBoxId+'" class="rl-tree-preview"></div>');
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+boundingBoxId+'"></div>');
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+hiddenBoundingBoxId+'"></div>');
        	
        	this.hiddenFieldsBox =  A.one('#'+hiddenBoundingBoxId).hide();
        	this.previewBoundingBox = A.one('#'+previewBoundingBoxId);
        	
        	this.contentTree = new A.TreeViewDD(
        		      {
        		        boundingBox: '#'+boundingBoxId,
        		        children: [
        		        	{
        		        		id: folderId,
        		        		label: folderLabel+'-'+folderId,
        		        		draggable: false,
        		        		alwaysShowHitArea: true,
        		        		leaf:false,
        		        		expanded: true
        		        	}
        		       	],
        		       	after: {
        		       		'drop:hit': A.bind(instance._afterDropHitHandler,this)
        		       	},
        		       	on: {
        		       		'drop:hit': A.bind(instance._dropHitHandler,this)
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
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_OPEN, 'g'),TPT_DELIM_OPEN);
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_CLOSE, 'g'),TPT_DELIM_CLOSE);
        	
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
            console.log("drophit");
        },
        
        _afterDropHitHandler: function(event){     	
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);
            
            //TODO: Review this, it would be better do this after drag node is added
            // If drop target is not loaded yet, we must empty to load all children
        	if (!(this._isFullLoaded(dropTreeNode))){
        		dropTreeNode.empty();
    			this._getChildren(dropTreeNode, this);
    		}
        	console.log("after drophit");
        },       
        
        _moveContentNode: function(node, target){
        	if (!this._isFolder(target)){
        		target = target.get(PARENT_NODE);
        	}
        	var parentNode = node.get(PARENT_NODE);
        	if (parentNode.get('id') != target.get('id')){
	        	if (this._isFolder(node)){
	        		this._moveContentFolder(node, target);
	        	}
	        	else{
	        		this._moveContentEntry(node, target);
	        	}
        	}       	        	
        },
        
        _moveContentFolder: function(folder, target){
        	Liferay.Service(
    			'/dlapp/move-folder',
    			{
    				repositoryId: this.repository,
    				folderId: folder.get('id'),
    				parentFolderId: target.get('id'),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.repository
                        }
                    )
    			}
        	);
        },
        
        _moveContentEntry: function(entry, target){        	
        	Liferay.Service(
    			'/dlapp/move-file-entry',
    			{
    				repositoryId: this.repository,        				
    				fileEntryId: entry.get('id'),
    				newFolderId: target.get('id'),
    				serviceContext: JSON.stringify(
                        {
                        	scopeGroupId: this.repository
                        }
                    )
    			}
        	);
        },
        
        _mouseOverHandler: function(event){
        	event.stopPropagation();
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.get('id'));
        	this._showPreview(treeNode);
        },
        
        _goToFileEntryViewPage: function(event){
        	event.stopPropagation();
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.get('id'));
			var viewURL = Liferay.PortletURL.createURL(this.fileEntryBaseURL);
			viewURL.setParameter("fileEntryId", treeNode.get('id'));
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
        		var treeNode = this.contentTree.getNodeById(event.currentTarget.get('id'));
        		if (!this._isFolder(treeNode)){
        			this._goToFileEntryViewPage(event);
        		}
        		else{
        			this._clickCheckBox(event);  
        		}
        	}
        	
        },
        
        _createPreview: function(treeNode){        	
        	var previewImgId = this.ns + NODE_ATTR_PREVIEW_IMG_PREF + treeNode.get('id');
        	var previewURL = treeNode.get(NODE_ATTR_PREVIEW_URL);      	    
        	var previewNode = A.Lang.sub(TPL_PREVIEW_NODE, {"imgId":previewImgId,"previewFileURL":previewURL});      	
        	treeNode.set(NODE_ATTR_PREVIEW_IMG_NODE, previewNode);    	
        	return previewNode;
        },
        
        _clickCheckBox: function(event){
        	var selectedNodeId = event.currentTarget.attr('id');
        	var relatedCheckbox = this.hiddenFieldsBox.one('[type=checkbox][value='+selectedNodeId+']');        	
        	if (relatedCheckbox !== null){
        		relatedCheckbox.simulate("click");
        	}
        	 
        },
               
        _clickHitArea: function(event){
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.attr('id')); 
        	if (treeNode) {
        		if (!(this._isFullLoaded(treeNode))){
        			this._getChildren(treeNode, this);
        		}
        		else{
        			//if is loading children, it will be expanded anyway
        			treeNode.toggle();
        		}
            }
        },
        
        _selectAllHiddenCheckbox: function(event){
        	var checked = event.target.attr('checked');
        	this.contentTree.get(BOUNDING_BOX).all('.tree-node-checkbox-container').each(function(node){
        	var nodeChecked = node.one('[type=checkbox]').attr('checked');
        	if (nodeChecked !== checked){
        		  node.simulate('click');
        	  }
        	});
        },
                    
       _addContentNode: function(newNodeConfig, parentNode, isFolder){
    	   var forceBindUI = true;
    	   var nodeType = '';
    	   if (parentNode === undefined && newNodeConfig.parentFolderId !== undefined){
    		   parentNode = this.contentTree.getNodeById(newNodeConfig.parentFolderId);
       	   }
    	   if (newNodeConfig.showCheckbox){
    		   nodeType = 'check';
    	   }
    	   if (parentNode === undefined){
       			parentNode = this.contentRoot;
       		}
    	   var expanded = (newNodeConfig.expanded !== undefined)? newNodeConfig.expanded: false;
    	   var newNode = this.contentRoot.createNode(
			  {
			    id: newNodeConfig.id,
			    label: newNodeConfig.label+'-'+newNodeConfig.id,
			    draggable: true,
        		alwaysShowHitArea: true,
			    leaf:!isFolder,
			    type: nodeType,
        		expanded: expanded
			  }
			);        	
        	newNode.set(NODE_ATTR_IS_FOLDER, isFolder);
        	newNode.set(NODE_ATTR_FULL_LOADED, newNodeConfig.fullLoaded);        	
        	if (newNodeConfig.previewURL !== undefined){
        		newNode.set(NODE_ATTR_PREVIEW_URL, newNodeConfig.previewURL);
        		newNode.set(NODE_ATTR_PREVIEW_FILE_COUNT, newNodeConfig.previewFileCount);
        	}      	      	
        	parentNode.appendChild(newNode);        	
        	if (forceBindUI){
        		this.contentTree.bindUI();
        	}        	
        	if (nodeType === 'check'){
        		// add checkbox
        		this._addProcessCheckbox(newNodeConfig);
        	}
        },
        
        _addProcessCheckbox: function(newNodeConfig){
    		this.hiddenFieldsBox.append(this.compiledItemSelectorTemplate(newNodeConfig));
        },

        _getChildren: function(treeNode, instance) {        	   
        	// Get folders children of this folder
        	Liferay.Service(
           			'/content-tree-view-hook.enhanceddlapp/get-folders-and-file-entries-and-file-shortcuts',
           			{
           				repositoryId: instance.repository,
           				folderId: treeNode.get('id'),
           				status: WORKFLOW_STATUS_ANY,
           				includeMountFolders :true,
        				start: -1,
        				end: -1
           			},
           			function(folders) {
           				A.each(folders, function(item, index, collection){
           					var enableCheckbox = (item.deletePermission || item.updatePermission);
           					//if it is a file entry
           					if (item.fileEntryId !== undefined){           						
            					instance.addContentEntry({
            						id : item.fileEntryId.toString(),
            						label: item.title,
            						showCheckbox: enableCheckbox,
            						rowCheckerId: item.fileEntryId.toString(),
        							rowCheckerName: instance.fileEntryCheckerName,
            						expanded: false,
               						fullLoaded: true,
               						previewURL: item.previewFileURL,
               						previewFileCount: item.previewFileCount,
            					},treeNode);
           					}
           					//If it is a folder
           					else{
           						
	           					instance.addContentFolder({
	           						id : item.folderId.toString(),
	           						label: item.name,
	           						showCheckbox: enableCheckbox,
	           						rowCheckerId: item.folderId.toString(),
        							rowCheckerName: instance.folderCheckerName,
	           						expanded: false,
	           						fullLoaded: false
	           					},treeNode);
           					}
           				});
           			}
           		);        	   
        	treeNode.set(NODE_ATTR_FULL_LOADED, true);
        	treeNode.expand();
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
            fileEntryBaseURL:{
            	value: null
            },
            fileEntryCheckerName:{
            	value: null
            },
            folderCheckerName:{
            	value: null
            },
            shortcutCheckerName:{
            	value: null
            }
        }
    });
 
}, '1.0.0', {
    requires: ['aui-tree-view','json','liferay-portlet-url','handlebars', 'liferay-preview']
});
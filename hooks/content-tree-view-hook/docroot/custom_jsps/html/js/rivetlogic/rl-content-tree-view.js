AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var TREE_NODE = 'tree-node';
	var NODE_SELECTOR = '.'+TREE_NODE;
	var PARENT_NODE = 'parentNode';
	var NODE = 'node';
	var NODE_ATTR_IS_FOLDER = 'isFolder';
	var NODE_ATTR_FULL_LOADED = 'fullLoaded';
	var NODE_ATTR_PREVIEW_DIV_PREF = 'previewTreeDiv';
	var NODE_ATTR_PREVIEW_OBJECT = 'previewObject';
	var NODE_ATTR_PREVIEW_URL = 'previewURL';
	var NODE_ATTR_PREVIEW_FILE_COUNT = 'previewFileCount';
	var NODE_ATTR_HAS_AUDIO = 'hasAudio';
	var NODE_ATTR_HAS_VIDEO = 'hasVideo';
	var NODE_ATTR_HAS_IMAGES = 'hasImages';
	var NODE_ATTR_NO_PREVIEW_GENERATION = 'noPreviewGeneration';
	var NODE_ATTR_PREVIEW_WILL_TAKE_TIME = 'previewWillTakeTime';
	var TPT_DELIM_OPEN = '{{';
	var TPT_DELIM_CLOSE = '}}';
	var TPT_ENCODED_DELIM_OPEN = '&#x7b;&#x7b;';
	var TPT_ENCODED_DELIM_CLOSE = '&#x7d;&#x7d;';
	var WORKFLOW_STATUS_ANY = -1;
	//var FOLER_CLASS_NAME = 'com.liferay.portlet.documentlibrary.model.DLFolder';
	 
    A.Rivet.ContentTreeView = A.Base.create('rl-content-tree-view',A.Base, [], {

    	ns : null,
    	repository: null,
    	scopeGroup: null,
    	contentTree: null,
    	contentRoot : null,
    	compiledEntryDetailTemplate: null,
    	compiledItemSelectorTemplate: null,
    	compiledPreviewItemSelectorTemplate: null,
    	hiddenFieldsBox: null,
    	previewBoundingBox: null,

        initializer: function () {
        
        	this.ns = this.get('namespace');
        	this.repository = this.get('repositoryId');
        	this.scopeGroup = this.get('scopeGroupId');
        	
        	var instance = this;
        	var boundingBoxId = this.ns + this.get('treeBox');
        	var hiddenBoundingBoxId = boundingBoxId + 'HiddenFields';
        	var previewBoundingBoxId = boundingBoxId + 'Preview';
        	var folderId = this.get('rootFolderId');
        	var folderLabel = this.get('rootFolderLabel');
        	var checkAllEntriesId = this.get('checkAllId');
        	
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+previewBoundingBoxId+'"></div>');
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
        		       		'drop:hit': A.bind(instance._afterDropHitRivetHandler,this)
        		       	},
        		       	on: {
        		       		'drop:hit': A.bind(instance._dropHitRivetHandler,this)
        		       	    /*lastSelectedChange: function(event){  
        		       	      var id = event.newVal.get('id');  
        		       	      selected = id;  
        		       	      console.log ("selected "+id);
        		       	    } */
        		       	}
        		      }
        		    ).render();
        	
        	this.contentRoot = this.contentTree.getNodeById(folderId);
        	this.contentRoot.set(NODE_ATTR_IS_FOLDER, true);
        	this.contentRoot.set(NODE_ATTR_FULL_LOADED, true);
        	
        	// Adding this event on this way because the click event seems on creations seems to be on tree level
        	var boundingBox = this.contentTree.get(BOUNDING_BOX);        	
        	boundingBox.delegate('click', A.bind(instance._clickRivetHandler,this), NODE_SELECTOR); 

        	// This is used to sync the selection from toolbar
        	A.one('#'+this.ns+checkAllEntriesId+'Checkbox').on('click',A.bind(instance._selectAllHiddenCheckbox,this));
        	
        	//templates
        	var entryDetailTemplate = A.one('#'+this.ns+'entry-details-template').get('innerHTML');
        	var itemSelectorTemplate = A.one('#'+this.ns+'item-selector-template').get('innerHTML');
        	var previewTemplate = A.one('#'+this.ns+'item-preview-template').get('innerHTML');
        	
        	// some template tokens get lost because encoding:
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_OPEN, 'g'),TPT_DELIM_OPEN);
        	itemSelectorTemplate = itemSelectorTemplate.replace(new RegExp(TPT_ENCODED_DELIM_CLOSE, 'g'),TPT_DELIM_CLOSE);
        	
            // compiles templates
        	this.compiledEntryDetailTemplate = A.Handlebars.compile(entryDetailTemplate);
            this.compiledItemSelectorTemplate = A.Handlebars.compile(itemSelectorTemplate);
            this.compiledPreviewItemSelectorTemplate = A.Handlebars.compile(previewTemplate);
        },
        
        addContentFolder: function(newNodeConfig, parentNode){	
        	
        	this._addContentNode(newNodeConfig, parentNode, true);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	newNodeConfig.expanded = false;
        	newNodeConfig.fullLoaded = true;
        	this._addContentNode(newNodeConfig, parentNode, false);
        	//this._addEntryDetail(newNodeConfig);
        },
        
        _dropHitRivetHandler: function(event){
        	
        	var dragNode = event.drag.get(NODE).get(PARENT_NODE);
            var dragTreeNode = dragNode.getData(TREE_NODE);
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);
            
            this._moveContentNode(dragTreeNode,dropTreeNode);
            	
        },
        _afterDropHitRivetHandler: function(event){
        	
        	console.log('after drop hit');console.log(event);
        	
            var dropNode = event.drop.get(NODE).get(PARENT_NODE);
            var dropTreeNode = dropNode.getData(TREE_NODE);
            
            console.log(dropTreeNode);
            
            //TODO: Review this, it would be better do this after drag node is added
            // If drop target is not loaded yet, we must empty to load all children
        	if (!(this._isFullLoaded(dropTreeNode))){
        		dropTreeNode.empty();
    			this._getChildren(dropTreeNode, this);
    		}
            	
        },
        
        _dropOverRivetHandler: function(event){
        	var dropNode = event.drop.get(NODE).get(PARENT_NODE);
        	console.log('dropNode');console.log(dropNode);
            var dropTreeNode = dropNode.getData(TREE_NODE);
            console.log('dropTreeNode');console.log(dropTreeNode);
        },
        
        _moveContentNode: function(node, target){
        	
        	console.log('target');console.log(target);
        	if (!this._isFolder(target)){
        		console.log("is a leaf getting parent");
        		target = target.get(PARENT_NODE);
        	}
        	console.log('target');console.log(target);
        	
        	
        	var parentNode = node.get(PARENT_NODE);
        	console.log('parentNode');console.log(parentNode);
        	
        	if (parentNode.get('id') != target.get('id')){
        		
	    		console.log(" moving "+node.get('id')+"-"+node.get('label'));
	            console.log(" to "+target.get('id')+"-"+target.get('label'));
	        	
	        	if (this._isFolder(node)){
	        		this._moveContentFolder(node, target);
	        	}
	        	else{
	        		this._moveContentEntry(node, target);
	        	}
        	}
        	else{
        		console.log("no moved because is the same target folder");
        	}
        	        	
        },
        
        _moveContentFolder: function(folder, target){
        	console.log("folder id "+folder.get('id'));
        	console.log("target id "+target.get('id'));
        	console.log("repository id "+this.repository);
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
        	console.log("entry id "+entry.get('id'));
        	console.log("target id "+target.get('id'));
        	console.log("repository id "+this.repository);
        	
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
        
        _clickRivetHandler: function(event){

        	event.stopPropagation();
        	
        	this._clickTreeNode(event);
        	
        	var isHitArea = event.target.hasClass('tree-hitarea');
        	
        	//If click is over label it change the check status. 
        	// But it doesn't happen if it is the hit area.
        	if (!isHitArea){
        		this._clickCheckBox(event);
        		this._showPreview(event);
        	}
        },
        
        _showPreview: function(event){
        	var treeNode = this.contentTree.getNodeById(event.currentTarget.attr('id'));
        	var previewURL = treeNode.get(NODE_ATTR_PREVIEW_URL);
        	var preview = treeNode.get(NODE_ATTR_PREVIEW_OBJECT);
        	if (!preview && previewURL !== undefined){
        		preview = this._createPreview(treeNode);
        	}       	
        },
        
        _createPreview: function(treeNode){
               	
        	console.log('preview url '+treeNode.get(NODE_ATTR_PREVIEW_URL));
        	console.log('preview url '+treeNode.get(NODE_ATTR_PREVIEW_FILE_COUNT));
        	
        	var previewDivId = this.ns + NODE_ATTR_PREVIEW_DIV_PREF + treeNode.get('id');
        	
        	this.previewBoundingBox.append(this.compiledPreviewItemSelectorTemplate(
        				{
        					previewDivId: previewDivId,
        					previewFileCount: treeNode.get(NODE_ATTR_PREVIEW_FILE_COUNT),
        					previewURL: treeNode.get(NODE_ATTR_PREVIEW_URL),
        					noPreviewGeneration: treeNode.get(NODE_ATTR_NO_PREVIEW_GENERATION),
        					previewWillTakeTime: treeNode.get(NODE_ATTR_PREVIEW_WILL_TAKE_TIME),
        					hasAudio: treeNode.get(NODE_ATTR_HAS_AUDIO),
        					hasImages: treeNode.get(NODE_ATTR_HAS_IMAGES),
        					hasVideo: treeNode.get(NODE_ATTR_HAS_VIDEO)
        				}
        			));
        	
        	var pvDivSelector = '#'+ previewDivId + '  #'+ this.ns ;
        	
        	var preview = new Liferay.Preview(
					{
						actionContent: pvDivSelector + 'previewFileActions',
						baseImageURL: treeNode.get(NODE_ATTR_PREVIEW_URL),
						boundingBox: pvDivSelector + 'previewFile',
						contentBox: pvDivSelector + 'previewFileContent',
						currentPreviewImage: pvDivSelector + 'previewFileImage',
						imageListContent: pvDivSelector + 'previewImagesContent',
						maxIndex: treeNode.get(NODE_ATTR_PREVIEW_FILE_COUNT), 
						previewFileIndexNode: pvDivSelector + 'previewFileIndex',
						toolbar: pvDivSelector + 'previewToolbar'
					}
				);
        	
        	treeNode.set(NODE_ATTR_PREVIEW_OBJECT, preview);
        	
        	preview.render();
        },
        
        _clickCheckBox: function(event){
        	
        	console.log('click check box');
        	
        	var selectedNode = event.currentTarget.attr('id');
        	
        	var relatedCheckbox = this.hiddenFieldsBox.one('[type=checkbox][value='+selectedNode+']');
        	
        	if (relatedCheckbox !== null){        	
        		relatedCheckbox.simulate("click");
        	}
        },
        
        _clickTreeNode: function(event){

        	console.log('click tree node');
        	
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
        	  console.log(node);
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
        		newNode.set(NODE_ATTR_HAS_AUDIO, newNodeConfig.hasAudio);
        		newNode.set(NODE_ATTR_HAS_VIDEO, newNodeConfig.hasVideo);
        		newNode.set(NODE_ATTR_HAS_IMAGES, newNodeConfig.hasImages);
        		newNode.set(NODE_ATTR_NO_PREVIEW_GENERATION, newNodeConfig.noPreviewGeneration);
        		newNode.set(NODE_ATTR_PREVIEW_WILL_TAKE_TIME, newNodeConfig.previewWillTakeTime);
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
        	console.log("adding checkbox");
        	console.log(newNodeConfig);
        	//just for first level items
        	if (newNodeConfig.rowCheckerId !== undefined){
        		this.hiddenFieldsBox.append(this.compiledItemSelectorTemplate(newNodeConfig));
        	}
        },
        
        _addEntryDetail: function(entry){
        	console.log('entry>');console.log(entry);
        	
            // data
            var data = {
                "title": entry.title,
                "shortTitle": entry.title,
                "linkTitle": entry.title + " - " + entry.description
            };
            data.count = 1;
         
           // finally, set the DOM
           // A.one('.users-list').append(compiledEntryDetailTemplate(data));
           // console.log(this.compiledEntryDetailTemplate(data));
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
           					
           					//if it is a file entry
           					if (item.fileEntryId !== undefined){
           						console.log('file entry:');console.log(item);
           						checkbox = (item.deletePermission);
            					instance.addContentEntry({
            						id : item.fileEntryId.toString(),
            						label: item.title,
            						showCheckbox: checkbox,
            						expanded: false,
               						fullLoaded : true,
               						previewURL: item.previewFileURL,
               						previewFileCount: item.previewFileCount,
               						noPreviewGeneration: item.noPreviewGeneration,
               						previewWillTakeTime: item.previewWillTakeTime,
               						hasAudio: item.hasAudio,
               						hasImages: item.hasImages,
               						hasVideo: item.hasVideo
            					},treeNode);
           					}
           					//If it is a folder
           					else{
           						console.log('folder:');console.log(item);           						
           						checkbox = (item.updatePermission);
	           					instance.addContentFolder({
	           						id : item.folderId.toString(),
	           						label: item.name,
	           						showCheckbox: checkbox,
	           						expanded: false,
	           						fullLoaded : false
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
            currentFolderId: {
                value: null
            },
            currentFolderLabel:{
            	value: null
            },
            checkAllId:{
            	value: null
            }
        }
    });
 
}, '1.0.0', {
    requires: ['aui-tree-view','json','liferay-portlet-url','handlebars', 'liferay-preview']
});
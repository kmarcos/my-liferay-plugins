AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var NODE_SELECTOR = '.tree-node';
	var TREE_NODE = 'tree-node';
	var PARENT_NODE = 'parentNode';
	var NODE = 'node';
	var NODE_ATTR_IS_FOLDER = 'isFolder';
	var NODE_ATTR_FULL_LOADED = 'fullLoaded';
	 
    A.Rivet.ContentTreeView = A.Base.create('rl-content-tree-view',A.Base, [], {

    	ns : null,
    	repository: null,
    	contentTree: null,
    	contentRoot : null,

        initializer: function () {
        
        	this.ns = this.get('namespace');
        	this.repository = this.get('repositoryId');
        	
        	var instance = this;
        	var boundingBoxId = this.ns + this.get('treeBox');
        	var folderId = this.get('rootFolderId');
        	var folderLabel = this.get('rootFolderLabel');
        	
        	A.one('#'+this.ns+'entriesContainer').append('<div id="'+boundingBoxId+'"></div>');
        	
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
        		       		'drop:hit': A.bind(instance._dropHitRivetHandler,this),        		       		
        		       	    lastSelectedChange: function(event){  
        		       	      var id = event.newVal.get('id');  
        		       	      selected = id;  
        		       	      console.log ("selected "+id);
        		       	    } 
        		       	}
        		      }
        		    ).render();
        	
        	this.contentRoot = this.contentTree.getNodeById(folderId);
        	this.contentRoot.set(NODE_ATTR_IS_FOLDER, true);
        	this.contentRoot.set(NODE_ATTR_FULL_LOADED, true);
        	
        	// Adding this event on this way because the click event seems on creations seems to be on tree level
        	var boundingBox = this.contentTree.get(BOUNDING_BOX);        	
        	boundingBox.delegate('click', A.bind(instance._clickRivetHandler,this), NODE_SELECTOR);
        },
        
        addContentFolder: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, true, false);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	
        	this._addContentNode(newNodeConfig, parentNode, false, true);
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

        	console.log('onclick handler');
        	event.stopPropagation();

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
        
       _addContentNode: function(newNodeConfig, parentNode, isFolder, fullLoaded){       	  
        	var newNode = this.contentRoot.createNode(
			  {
			    id: newNodeConfig.id,
			    label: newNodeConfig.label+'-'+newNodeConfig.id,
			    draggable: true,
        		alwaysShowHitArea: true,
			    leaf:!isFolder,
        		expanded: false
			  }
			);
        	
        	newNode.set(NODE_ATTR_IS_FOLDER, isFolder);
        	newNode.set(NODE_ATTR_FULL_LOADED, fullLoaded);
        	
        	var forceBindUI = true;
        	if (parentNode === undefined){
        		parentNode = this.contentRoot;
        		forceBindUI = false;
        	}
        	      	
        	parentNode.appendChild(newNode);
        	
        	if (forceBindUI){
        		this.contentTree.bindUI();
        	}
        },
        
        _getChildren: function(treeNode, instance) {        	
        	   
        	// Get folders children of this folder
        	Liferay.Service(
           			'/dlapp/get-folders',
           			{
           				repositoryId: instance.repository,
           				parentFolderId: treeNode.get('id')
           			},
           			function(folders) {
           				A.each(folders, function(item, index, collection){    

           					instance.addContentFolder({
           						id : item.folderId.toString(),
           						label: item.name
           					},treeNode);
           				});
           			}
           		);
        	
        	// Get entries children of this folder
        	Liferay.Service(
        			'/dlapp/get-file-entries',
        			{
        				repositoryId: instance.repository,
        				folderId: treeNode.get('id')
        			},
        			function(entries) {
        				
        				A.each(entries, function(item, index, collection){
        					
        					instance.addContentEntry({
        						id : item.fileEntryId.toString(),
        						label: item.title
        					},treeNode);
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
            rootFolderId: {
                value: null
            },
            rootFolderLabel:{
            	value: null
            }
        }
    });
 
}, '1.0.0', {
    requires: ['aui-tree-view','json','liferay-portlet-url']
});
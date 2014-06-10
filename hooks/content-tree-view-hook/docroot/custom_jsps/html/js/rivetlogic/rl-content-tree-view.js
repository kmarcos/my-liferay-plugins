AUI.add('rl-content-tree-view', function (A) {
	
	A.namespace('Rivet');

	var BOUNDING_BOX = 'boundingBox';
	var NODE_SELECTOR = '.tree-node';
	 
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
        		        		label: folderLabel
        		        	}
        		       	]
        		      }
        		    ).render();
        	
        	this.contentRoot = this.contentTree.getNodeById(folderId);
        	this.contentRoot.set('isFolder', true);
        	this.contentRoot.set('fullLoaded', true);
        	
        	var boundingBox = this.contentTree.get(BOUNDING_BOX);        	
        	boundingBox.delegate('click', A.bind(instance._clickRivetHandler,this), NODE_SELECTOR); 

        },
        
        addContentFolder: function(newNodeConfig, parentNode){
        	
        	_addContentNode(newNodeConfig, parentNode, true, false);
        },
        
        addContentEntry: function(newNodeConfig, parentNode){
        	
        	_addContentNode(newNodeConfig, parentNode, false, true);
        },
        
        _clickRivetHandler: function(event){
        	console.log("click node ");
        	event.stopPropagation();

        	var treeNode = this.contentTree.getNodeById(event.currentTarget.attr('id'));
        	if (treeNode) {
        		console.log(treeNode);
        		console.log(treeNode.get('label'));
        		console.log(treeNode.get('isFolder'));
        		console.log(treeNode.get('fullLoaded'));
        		
        	} 
        	if (treeNode && !(treeNode.get('fullLoaded'))){
        		console.log('loading children...');
        		this._getChildren(treeNode);
        	}
        },
        
       _addContentNode: function(newNodeConfig, parentNode, isFolder, fullLoaded){
        	
        	if (parentNode === undefined){
        		parentNode = this.contentRoot;
        	}
                	
        	var newNode = parentNode.createNode(
			  {
			    id: newNodeConfig.id,
			    label: newNodeConfig.label
			    
			  }
			);
        	newNode.set('isFolder', isFolder);
        	newNode.set('fullLoaded', fullLoaded);
        	parentNode.appendChild(newNode);
        },
        
        _getChildren: function(treeNode) {
        	   
        	   Liferay.Service(
        			'/dlapp/get-file-entries',
        			{
        				repositoryId: this.repository,
        				folderId: treeNode.get('id')
        			},
        			function(entries) {
        				console.log(entries);
        				A.each(entries, function(item, index, collection){      					
        					
        					treeNode.expand();

        					this.addContentEntry({
        						id : item.fileEntryId,
        						label: item.title
        					},treeNode);
        				});
        			}
        		);
        	   
        	   Liferay.Service(
           			'/dlapp/get-folders',
           			{
           				repositoryId: this.repository,
           				folderId: treeNode.get('id')
           			},
           			function(folders) {
           				console.log(folders);
           				A.each(folders, function(item, index, collection){      					
           					
           					treeNode.expand();

           					this.addContentFolder({
           						id : item.folderId,
           						label: item.name
           					},treeNode);
           				});
           			}
           		);
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
    requires: ['aui-tree-view']
});
<%@ include file="/html/portlet/document_library/init.jsp" %>

<%
	Folder folder = (Folder)request.getAttribute("view_entries.jsp-folder");
%>

<aui:script use="rl-content-tree-view">

<portlet:namespace />treeView.addContentFolder({
	id : '<%=folder.getFolderId() %>',
	label: '<%=folder.getName() %>'
});

</aui:script>

<aui:script use="json,liferay-portlet-url">

/*
function getEntries(e) {
   
   Liferay.Service(
		'/dlapp/get-file-entries',
		{
			repositoryId: <%=folder.getRepositoryId() %>,
			folderId: <%=folder.getFolderId() %>
		},
		function(entries) {
			console.log(entries);
			A.each(entries, function(item, index, collection){
				
				var thisFolder = <portlet:namespace />treeView.getNodeById('<%= folder.getFolderId() %>');
				thisFolder.expand();

				var childEntry = thisFolder.createNode(
				  {
				    id: item.fileEntryId,
				    label: item.title
				  }
				);

				thisFolder.appendChild(childEntry);
			});
		}
	);
}

function getFolders(e) {
   
   Liferay.Service(
		'/dlapp/get-folders',
		{
			repositoryId: <%=folder.getRepositoryId() %>,
			parentFolderId: <%=folder.getFolderId() %>
		},
		function(folders) {
			console.log(folders);
			A.each(folders, function(item, index, collection){
				
				var thisFolder = <portlet:namespace />treeView.getNodeById('<%= folder.getFolderId() %>');
				thisFolder.expand();

				var childFolder = thisFolder.createNode(
				  {
				    id: item.folderId,
				    label: item.name,
				    canHaveChildren: true
				  }
				);

				thisFolder.appendChild(childFolder);
			});
		}
	);
}

function loadChildren(e){
	getFolders(e);
	getEntries(e);
};

A.one('#<%= folder.getFolderId() %>').on('click',loadChildren);

*/
</aui:script>


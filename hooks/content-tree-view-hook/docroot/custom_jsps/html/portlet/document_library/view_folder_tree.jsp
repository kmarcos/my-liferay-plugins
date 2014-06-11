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

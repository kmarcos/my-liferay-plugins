<%@ include file="/html/portlet/document_library/init.jsp" %>

<%
FileEntry fileEntry = (FileEntry)request.getAttribute("view_entries.jsp-fileEntry");
FileVersion latestFileVersion = fileEntry.getFileVersion();
%>

<aui:script use="rl-content-tree-view">

<portlet:namespace />treeView.addContentEntry({
	id : '<%= latestFileVersion.getFileEntryId() %>',
	label: '<%= latestFileVersion.getTitle() %>'
});
</aui:script>

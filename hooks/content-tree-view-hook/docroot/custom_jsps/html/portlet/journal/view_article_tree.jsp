<%@ include file="/html/portlet/journal/init.jsp" %>

<%
JournalArticle article = (JournalArticle)request.getAttribute("view_entries.jsp-article");

PortletURL tempRowURL = (PortletURL)request.getAttribute("view_entries.jsp-tempRowURL");

String articleImageURL = article.getArticleImageURL(themeDisplay);
%>

<aui:script use="rl-content-tree-view">

<portlet:namespace />treeView.addContentEntry({
	id : '<%= article.getArticleId() %>',
	label: '<%= article.getTitle(locale) %>',
	title: '<%= article.getTitle(locale) %>',
	description: '<%= article.getDescription(locale) %>',
	showCheckbox: '<%= JournalArticlePermission.contains(permissionChecker, article, ActionKeys.DELETE) || JournalArticlePermission.contains(permissionChecker, article, ActionKeys.EXPIRE) || JournalArticlePermission.contains(permissionChecker, article, ActionKeys.UPDATE) %>',
	rowCheckerId: '<%= String.valueOf(article.getArticleId()) %>',
	rowCheckerName: '<%= JournalArticle.class.getSimpleName() %>',
	parentFolderId: '<%= article.getFolderId() %>',
	previewURL:'<%= Validator.isNotNull(articleImageURL) ? articleImageURL : themeDisplay.getPathThemeImages() + "/file_system/large/article.png" %>',
	viewURL: '<%= tempRowURL %>'
});
</aui:script>
<%--
/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */
--%>

<%-- RivetLogic Custom BEGINS --%>
<%
String TREE_VIEW = "tree";
if (themeDisplay.isSignedIn()){
    int newDisplayIdx = displayViews.length;
	String[] displayViewsAugmented = Arrays.copyOf(displayViews, displayViews.length + 1);   
	displayViewsAugmented[newDisplayIdx] = TREE_VIEW;
	displayViews = displayViewsAugmented;
}
else{
    System.out.println("no signed in");
}
%>

<aui:script>                   
AUI().applyConfig({
    groups : {
        'rivet-custom' : {
            base : '/html/js/rivetlogic/',
            async : false,
            modules : {
                'rl-content-tree-view': {
                        path: 'rl-content-tree-view.js',
                        requires: [
                            'aui-tree-view'
                        ]
                },

            }
        }
    }
});
</aui:script>

<aui:script use="aui-base">
var <portlet:namespace />treeView;
</aui:script>

<%-- RivetLogic Custom ENDS --%>
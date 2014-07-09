/**
 * Copyright (C) 2014 Rivet Logic Corporation. All rights reserved.
 */

/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.rivetlogic.tree.view.service.impl;

import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.staging.permission.StagingPermissionUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.permission.WorkflowPermissionUtil;
import com.liferay.portal.security.auth.PrincipalException;
import com.liferay.portal.security.permission.ActionKeys;
import com.liferay.portal.security.permission.PermissionChecker;
import com.liferay.portal.util.PortletKeys;
import com.liferay.portal.webserver.WebServerServletTokenUtil;
import com.liferay.portlet.journal.model.JournalArticle;
import com.liferay.portlet.journal.model.JournalFolder;
import com.liferay.portlet.journal.service.JournalFolderServiceUtil;
import com.rivetlogic.tree.view.model.journal.WCArticle;
import com.rivetlogic.tree.view.model.journal.WCFolder;
import com.rivetlogic.tree.view.service.base.EnhancedJournalAppServiceBaseImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * The implementation of the enhanced journal app remote service.
 * 
 * <p>
 * All custom service methods should be put in this class. Whenever methods are
 * added, rerun ServiceBuilder to copy their definitions into the
 * {@link com.rivetlogic.tree.view.service.EnhancedJournalAppService} interface.
 * 
 * <p>
 * This is a remote service. Methods of this service are expected to have
 * security checks based on the propagated JAAS credentials because this service
 * can be accessed remotely.
 * </p>
 * 
 * @author rivetlogic
 * @see com.rivetlogic.tree.view.service.base.EnhancedJournalAppServiceBaseImpl
 * @see com.rivetlogic.tree.view.service.EnhancedJournalAppServiceUtil
 */
public class EnhancedJournalAppServiceImpl extends EnhancedJournalAppServiceBaseImpl {
    /*
     * NOTE FOR DEVELOPERS:
     * 
     * Never reference this interface directly. Always use {@link
     * com.rivetlogic.tree.view.service.EnhancedJournalAppServiceUtil} to access
     * the enhanced journal app remote service.
     */

    private static final Log log = LogFactoryUtil.getLog(EnhancedJournalAppServiceImpl.class);

    public List<Object> getFoldersAndArticles(long groupId, long folderId, int start, int end) throws SystemException {

        List<Object> items = JournalFolderServiceUtil.getFoldersAndArticles(groupId, folderId, start, end, null);

        List<Object> results = new ArrayList<Object>();

        for (Object o : items) {

            if (o instanceof JournalFolder) {
                JournalFolder folder = (JournalFolder) o;
                WCFolder wcFolder = new WCFolder(folder);
                wcFolder.setDeletePermission(hasJournalFolderPermission(folder, ActionKeys.DELETE));
                wcFolder.setUpdatePermission(hasJournalFolderPermission(folder, ActionKeys.UPDATE));
                results.add(wcFolder);
            }
            if (o instanceof JournalArticle) {
                JournalArticle article = (JournalArticle) o;
                WCArticle wcArticle = new WCArticle(article);
                wcArticle.setArticleImageURL(getArticleImageURL(article));
                wcArticle.setDeletePermission(hasJournalArticlePermission(article, ActionKeys.DELETE));
                wcArticle.setUpdatePermission(hasJournalArticlePermission(article, ActionKeys.UPDATE));
                wcArticle.setExpirePermission(hasJournalArticlePermission(article, ActionKeys.EXPIRE));
                results.add(wcArticle);
            }
        }

        return results;
    }

    /***
     * This was taken from JournalFolderPermission which is located in
     * portal-impl. The code was shortened because we are expecting to evaluate
     * just Delete and Update actions for now.
     * 
     * @param folder
     * @return true if it has permission the given action
     */
    private boolean hasJournalFolderPermission(JournalFolder folder, String actionId) {

        PermissionChecker permissionChecker;
        try {
            permissionChecker = getPermissionChecker();
        } catch (PrincipalException e) {
            log.error(e);
            return false;
        }

        Boolean hasPermission = StagingPermissionUtil.hasPermission(permissionChecker, folder.getGroupId(),
                JournalFolder.class.getName(), folder.getFolderId(), PortletKeys.JOURNAL, actionId);

        if (hasPermission != null) {
            return hasPermission.booleanValue();
        }
        return _hasPermission(permissionChecker, folder, actionId);
    }

    /***
     * This function was taken from JournalFolderPermission which is located in
     * portal-impl.
     * 
     * @param permissionChecker
     * @param folder
     * @param actionId
     * @return
     */
    private static boolean _hasPermission(PermissionChecker permissionChecker, JournalFolder folder, String actionId) {

        if (permissionChecker.hasOwnerPermission(folder.getCompanyId(), JournalFolder.class.getName(),
                folder.getFolderId(), folder.getUserId(), actionId)
                || permissionChecker.hasPermission(folder.getGroupId(), JournalFolder.class.getName(),
                        folder.getFolderId(), actionId)) {

            return true;
        }

        return false;
    }

    /***
     * This was taken from JournalArticlePermission which is located in
     * portal-impl. The code was shortened because we are expecting to evaluate
     * just Delete and Update actions for now.
     * 
     * @return
     */
    private boolean hasJournalArticlePermission(JournalArticle article, String actionId) {

        PermissionChecker permissionChecker;
        try {
            permissionChecker = getPermissionChecker();
        } catch (PrincipalException e) {
            log.error(e);
            return false;
        }

        Boolean hasPermission = StagingPermissionUtil.hasPermission(permissionChecker, article.getGroupId(),
                JournalArticle.class.getName(), article.getResourcePrimKey(), PortletKeys.JOURNAL, actionId);

        if (hasPermission != null) {
            return hasPermission.booleanValue();
        }

        if (article.isPending()) {
            hasPermission = WorkflowPermissionUtil.hasPermission(permissionChecker, article.getGroupId(),
                    JournalArticle.class.getName(), article.getResourcePrimKey(), actionId);

            if (hasPermission != null) {
                return hasPermission.booleanValue();
            }
        }

        if (permissionChecker.hasOwnerPermission(article.getCompanyId(), JournalArticle.class.getName(),
                article.getResourcePrimKey(), article.getUserId(), actionId)) {

            return true;
        }

        return permissionChecker.hasPermission(article.getGroupId(), JournalArticle.class.getName(),
                article.getResourcePrimKey(), actionId);
    }

    /**
     * This method is based in JournalArticleImpl.getArticleImageURL, but
     * without dependency to ThemeDisplay
     * 
     * @param article
     * @return
     */
    private String getArticleImageURL(JournalArticle article) {
        if (!article.isSmallImage()) {
            return null;
        }

        if (Validator.isNotNull(article.getSmallImageURL())) {
            return article.getSmallImageURL();
        }

        return "/journal/article?img_id=" + article.getSmallImageId() + "&t="
                + WebServerServletTokenUtil.getToken(article.getSmallImageId());
    }
}
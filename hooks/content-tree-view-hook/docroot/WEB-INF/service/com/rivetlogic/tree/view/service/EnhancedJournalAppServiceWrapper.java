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

package com.rivetlogic.tree.view.service;

import com.liferay.portal.service.ServiceWrapper;

/**
 * Provides a wrapper for {@link EnhancedJournalAppService}.
 *
 * @author rivetlogic
 * @see EnhancedJournalAppService
 * @generated
 */
public class EnhancedJournalAppServiceWrapper
	implements EnhancedJournalAppService,
		ServiceWrapper<EnhancedJournalAppService> {
	public EnhancedJournalAppServiceWrapper(
		EnhancedJournalAppService enhancedJournalAppService) {
		_enhancedJournalAppService = enhancedJournalAppService;
	}

	/**
	* Returns the Spring bean ID for this bean.
	*
	* @return the Spring bean ID for this bean
	*/
	@Override
	public java.lang.String getBeanIdentifier() {
		return _enhancedJournalAppService.getBeanIdentifier();
	}

	/**
	* Sets the Spring bean ID for this bean.
	*
	* @param beanIdentifier the Spring bean ID for this bean
	*/
	@Override
	public void setBeanIdentifier(java.lang.String beanIdentifier) {
		_enhancedJournalAppService.setBeanIdentifier(beanIdentifier);
	}

	@Override
	public java.lang.Object invokeMethod(java.lang.String name,
		java.lang.String[] parameterTypes, java.lang.Object[] arguments)
		throws java.lang.Throwable {
		return _enhancedJournalAppService.invokeMethod(name, parameterTypes,
			arguments);
	}

	@Override
	public java.util.List<java.lang.Object> getFoldersAndArticles(
		long groupId, long folderId, int start, int end)
		throws com.liferay.portal.kernel.exception.SystemException {
		return _enhancedJournalAppService.getFoldersAndArticles(groupId,
			folderId, start, end);
	}

	/**
	 * @deprecated As of 6.1.0, replaced by {@link #getWrappedService}
	 */
	public EnhancedJournalAppService getWrappedEnhancedJournalAppService() {
		return _enhancedJournalAppService;
	}

	/**
	 * @deprecated As of 6.1.0, replaced by {@link #setWrappedService}
	 */
	public void setWrappedEnhancedJournalAppService(
		EnhancedJournalAppService enhancedJournalAppService) {
		_enhancedJournalAppService = enhancedJournalAppService;
	}

	@Override
	public EnhancedJournalAppService getWrappedService() {
		return _enhancedJournalAppService;
	}

	@Override
	public void setWrappedService(
		EnhancedJournalAppService enhancedJournalAppService) {
		_enhancedJournalAppService = enhancedJournalAppService;
	}

	private EnhancedJournalAppService _enhancedJournalAppService;
}
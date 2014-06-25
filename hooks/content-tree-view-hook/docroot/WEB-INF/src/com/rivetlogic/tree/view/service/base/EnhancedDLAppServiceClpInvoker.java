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

package com.rivetlogic.tree.view.service.base;

import com.rivetlogic.tree.view.service.EnhancedDLAppServiceUtil;

import java.util.Arrays;

/**
 * @author rivetlogic
 * @generated
 */
public class EnhancedDLAppServiceClpInvoker {
	public EnhancedDLAppServiceClpInvoker() {
		_methodName14 = "getBeanIdentifier";

		_methodParameterTypes14 = new String[] {  };

		_methodName15 = "setBeanIdentifier";

		_methodParameterTypes15 = new String[] { "java.lang.String" };

		_methodName18 = "getFoldersAndFileEntriesAndFileShortcuts";

		_methodParameterTypes18 = new String[] {
				"long", "long", "int", "boolean", "int", "int"
			};
	}

	public Object invokeMethod(String name, String[] parameterTypes,
		Object[] arguments) throws Throwable {
		if (_methodName14.equals(name) &&
				Arrays.deepEquals(_methodParameterTypes14, parameterTypes)) {
			return EnhancedDLAppServiceUtil.getBeanIdentifier();
		}

		if (_methodName15.equals(name) &&
				Arrays.deepEquals(_methodParameterTypes15, parameterTypes)) {
			EnhancedDLAppServiceUtil.setBeanIdentifier((java.lang.String)arguments[0]);

			return null;
		}

		if (_methodName18.equals(name) &&
				Arrays.deepEquals(_methodParameterTypes18, parameterTypes)) {
			return EnhancedDLAppServiceUtil.getFoldersAndFileEntriesAndFileShortcuts(((Long)arguments[0]).longValue(),
				((Long)arguments[1]).longValue(),
				((Integer)arguments[2]).intValue(),
				((Boolean)arguments[3]).booleanValue(),
				((Integer)arguments[4]).intValue(),
				((Integer)arguments[5]).intValue());
		}

		throw new UnsupportedOperationException();
	}

	private String _methodName14;
	private String[] _methodParameterTypes14;
	private String _methodName15;
	private String[] _methodParameterTypes15;
	private String _methodName18;
	private String[] _methodParameterTypes18;
}
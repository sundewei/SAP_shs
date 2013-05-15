package com.sap.shs;

import com.sap.ext.shield.LogSender;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 11/25/12
 * Time: 8:21 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldSend extends BaseServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        String threadMapName = request.getParameter("threadMapName");
        LogSender logSender = new LogSender(request.getParameter("hdfsSourceFile"), request.getParameter("restUrl"));
        Map<String, Thread> threadMap = (Map<String, Thread>) session.getAttribute(threadMapName);
        if (threadMap == null) {
            threadMap = new HashMap<String, Thread>();
        }
        threadMap.put(logSender.getHdfsSourceFile(), logSender);
        session.setAttribute(threadMapName, threadMap);
        System.out.println("In Servlet, session.getAttribute(" + threadMapName + ")=" + session.getAttribute(threadMapName));
        logSender.start();
        PrintWriter out = response.getWriter();
        out.write(request.getParameter("hdfsSourceFile"));
        out.close();
    }
}

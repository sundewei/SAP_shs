package com.sap.shs;

import com.sap.ext.shield.LogSender;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 11/26/12
 * Time: 2:16 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShieldInfo extends BaseServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(true);
        String filename = request.getParameter("filename");
        String threadMapName = request.getParameter("threadMapName");
        Map<String, Thread> threadMap = (Map<String, Thread>) session.getAttribute(threadMapName);
        long count = -1l;
        if (threadMap != null) {
            LogSender logSender = (LogSender) threadMap.get(filename);
            if (logSender != null) {
                if (logSender.isAlive()) {
                    count = logSender.getSentLineCount();
                } else {
                    threadMap.remove(filename);
                }
            }
        }
        PrintWriter out = response.getWriter();
        out.write(String.valueOf(count));
        out.close();
    }
}

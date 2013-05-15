package com.sap.shs.demo;

import com.sap.shs.BaseServlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 12/29/11
 * Time: 11:00 PM
 * To change this template use File | Settings | File Templates.
 */
public class LoadMovieHtml extends BaseServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String movieId = request.getParameter("movieId");
        AmazonMovie movie = AmazonMovie.getAmazonMovie(Integer.parseInt(movieId));
        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        out.write(movie.getHtmlContent());
        out.close();
        out.flush();
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
}

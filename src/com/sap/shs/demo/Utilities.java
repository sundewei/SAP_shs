package com.sap.shs.demo;

import com.sap.hadoop.conf.ConfigurationManager;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Created by IntelliJ IDEA.
 * User: I827779
 * Date: 12/28/11
 * Time: 9:25 PM
 * To change this template use File | Settings | File Templates.
 */
public class Utilities {
    public static void refreshMovieRecommender(ConfigurationManager cm, String hdfsFolderPath, boolean forceRefresh) throws Exception {
        /*
        if (forceRefresh || !cm.getFileSystem().exists(hdfsFolderPath + "ratings.csv") ||
                !cm.getFileSystem().exists(hdfsFolderPath + "freqMovies.csv")) {
            Connection conn = getConnection();
            // 1. Generate the movie list
            AmazonMovie.refreshAmazonMovies(conn, cm, hdfsFolderPath);
            AmazonMovie.refreshMovieRatings(conn, cm, hdfsFolderPath + "ratings.csv");
            AmazonMovie.refreshFreqMovieList(conn, cm, hdfsFolderPath + "freqMovies.csv");
            conn.close();
        }
        */
        AmazonMovie.setAmazonMovies(AmazonMovie.getAmazonMovies(cm, hdfsFolderPath));
    }

    public static Connection getConnection() throws Exception {
        Class.forName("com.sap.db.jdbc.Driver");
        String url = "jdbc:sap://llnpal056:35015/SYSTEM";
        return DriverManager.getConnection(url, "SYSTEM", "Hadoophana123");
    }

    public static void main(String[] arg) throws Exception {
        ConfigurationManager cm = new ConfigurationManager("hadoop", "hadoop");
        refreshMovieRecommender(cm, "/user/hadoop/taskForceData/amazonMovieDemo/", true);
    }

}

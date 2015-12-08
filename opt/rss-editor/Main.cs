using System;
using Gtk;

namespace rss_editor
{
	class MainClass
	{
		public static void Main (string[] args)
		{
			Application.Init ();
			MainWindow win = new MainWindow ();
			win.Show ();
			Application.Run ();
		}
		
		public static string GetCurrentTime()
		{
			string month;
			if (DateTime.Now.Month == 1) { month = "Jan"; }
			else if (DateTime.Now.Month == 2) { month = "Fev"; }
			else if (DateTime.Now.Month == 3) { month = "Mar"; }
			else if (DateTime.Now.Month == 4) { month = "Abr"; }
			else if (DateTime.Now.Month == 5) { month = "Mai"; }
			else if (DateTime.Now.Month == 6) { month = "Jun"; }
			else if (DateTime.Now.Month == 7) { month = "Jul"; }
			else if (DateTime.Now.Month == 8) { month = "Ago"; }
			else if (DateTime.Now.Month == 9) { month = "Set"; }
			else if (DateTime.Now.Month == 10) { month = "Out"; }
			else if (DateTime.Now.Month == 11) { month = "Nov"; }
			else { month = "Dez"; }
			
			string current_time = Convert.ToString(DateTime.Now.Day + " " + month + " " + DateTime.Now.Year + " " + DateTime.Now.Hour + ":" 
			                                       																  + DateTime.Now.Minute + ":"
			                                       																  + DateTime.Now.Second);
			return current_time;
		}
	}
}

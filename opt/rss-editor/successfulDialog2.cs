using System;

namespace rss_editor
{
	public partial class successfulDialog2 : Gtk.Dialog
	{
		public successfulDialog2 ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			this.Destroy();
		}
	}
}

